import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "something went wrong while generting access and refresh tokens"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    if ([fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are reuqired");
    }
    //email validation
    if (!email.includes("@")) {
        throw new ApiError("Email should be valid");
    }

    const checkUserExist = await User.findOne({ email });

    if (checkUserExist) {
        // throw new ApiError(409, "User already exists");
        return res.status(409).json({ message: "User already exists" });
    }

    const user = await User.create({
        fullName,
        email,
        password,
        googleId: null,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registring user!");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User register successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(409).json({ message: " Email is required" });
    }

    const userExists = await User.findOne({ email });

    if (!userExists) {
        return res
            .status(409)
            .json({ message: "User not exists,please SignUp first!" });
    }

    const passwordCheck = await userExists.isPasswordCorrect(password);

    if (!passwordCheck) {
        return res.status(409).json({ message: "Invalid Password" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        userExists._id
    );

    const loggedInUser = await User.findById(userExists._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User loggedIn successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // Remove user session from Passport
    req.logout(async (err) => {
        if (err) {
            return res
                .status(500)
                .json(new ApiResponse(500, {}, "Logout failed"));
        }
        await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    refreshToken: undefined,
                },
            },
            {
                new: true,
            }
        );

        // Destroy the session
        req.session.destroy((destroyErr) => {
            if (destroyErr) {
                return res
                    .status(500)
                    .json(
                        new ApiResponse(500, {}, "Failed to destroy session")
                    );
            }
            const options = {
                httpOnly: true,
                secure: true,
            };

            return res
                .status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .clearCookie("connect.sid", options)
                .json(new ApiResponse(200, {}, "User Logged Out successfully"));
        });
    });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
        throw new ApiError(401, "Invalid Refresh Token");
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
        throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh Token was expired please login");
    }

    const { accessToken, newRefreshToken } = generateAccessAndRefreshTokens(
        user._id
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                201,
                { accessToken, refreshToken: newRefreshToken },
                "Access Token refreshed"
            )
        );
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(401, "Fields are required");
    }
    if (oldPassword === newPassword) {
        throw new ApiError(401, "Donot use previously used passwords");
    }

    const user = await User.findById(req.user?._id);
    const passwordCheck = await user.isPasswordCorrect(oldPassword);

    if (!passwordCheck) {
        throw new ApiError(401, "Invalid password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: true });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Passsword changed successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
};
