import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Profile } from "../models/profile.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const profileCreation = asyncHandler(async (req, res) => {
    const {
        personalAttributes,
        physicalAppearance,
        availabilityPreferences,
        audienceDemographic,
        socialMediaPresence,
        additionalSkills,
    } = req.body;

    console.log("Received request body:", req.body);
    try {
        // check if profile already created
        const existingProfile = await Profile.findOne({ owner: req.user._id });
        if (existingProfile) {
            return res.status(400).json({
                status: "error",
                message: "Profile already exists for this user",
            });
        }

        const profile = await Profile.create({
            owner: req.user._id,
            personalAttributes,
            physicalAppearance,
            availabilityPreferences,
            audienceDemographic,
            socialMediaPresence,
            additionalSkills,
        });

        return res
            .status(201)
            .json(
                new ApiResponse(200, profile, "Profile created successfully")
            );
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Profile creation failed",
            error: error.message,
        });
    }
});

const uploadProfilePic = asyncHandler(async (req, res) => {
    let profilePictureUrl;

    console.log("Profile :", req.files?.profilePicture);

    if (req.files && req.files.profilePicture) {
        console.log("Before upload");

        const uploadResponse = await uploadOnCloudinary(
            req.files.profilePicture.data,
            {
                folder: "BuzzVerse/profiles",
            }
        );
        console.log("After upload");

        if (!uploadResponse) {
            throw new ApiError(
                501,
                "Something went wrong while uploading Profile picture"
            );
        }
        profilePictureUrl = uploadResponse.secure_url;

        const profile = await Profile.findOneAndUpdate(
            { owner: req.user._id },
            { profilePicture: profilePictureUrl }, // Update with the picture URL
            { new: true } // Return the updated document
        );

        if (!profile) {
            return res
                .status(404)
                .json(new ApiResponse(404, {}, "Profile not found"));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    profile,
                    "Profile picture uploaded successfully"
                )
            );
    } else {
        return res
            .status(404)
            .json(new ApiResponse(400, {}, "Profile picture required"));
    }
});

const updateProfile = asyncHandler(async (req, res) => {
    const {
        personalAttributes,
        physicalAppearance,
        availabilityPreferences,
        audienceDemographic,
        socialMediaPresence,
        additionalSkills,
    } = req.body;

    try {
        // Find the user's profile by owner ID
        const profile = await Profile.findOne({ owner: req.user._id });

        if (!profile) {
            return res.status(404).json({
                status: "error",
                message: "Profile not found for this user",
            });
        }

        // Prepare updated fields, merging with existing data if fields are not provided
        const updatedData = {
            personalAttributes: {
                ...profile.personalAttributes,
                ...personalAttributes,
            },
            physicalAppearance: {
                ...profile.physicalAppearance,
                ...physicalAppearance,
            },
            availabilityPreferences: {
                ...profile.availabilityPreferences,
                ...availabilityPreferences,
            },
            audienceDemographic: {
                ...profile.audienceDemographic,
                ...audienceDemographic,
            },
            socialMediaPresence: {
                ...profile.socialMediaPresence,
                ...socialMediaPresence,
            },
            additionalSkills: {
                ...profile.additionalSkills,
                ...additionalSkills,
            },
        };

        // Use findByIdAndUpdate to update the profile with the merged data
        const updatedProfile = await Profile.findByIdAndUpdate(
            profile._id,
            updatedData,
            { new: true } // Return the updated document
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedProfile,
                    "Profile updated successfully"
                )
            );
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Profile update failed",
            error: error.message,
        });
    }
});

export { profileCreation, uploadProfilePic, updateProfile };
