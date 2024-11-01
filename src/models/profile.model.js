import mongoose, { Schema } from "mongoose";

const ProfileSchema = Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
    },
    personalAttributes: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        dob: { type: Date, required: true },
        location: { type: String, required: true },
        industry: {
            type: String,
            enum: ["Actor", "Cricketer", "Influencer", "Athlete"],
            required: true,
        },
        language: {
            type: [String],
            enum: ["English", "Hindi"],
            required: true,
        },
    },
    physicalAppearance: {
        height: { type: String },
        bodyType: {
            type: String,
            enum: [
                "Muscular",
                "Thin and Muscular",
                "Tall and Fit",
                "Slim",
                "Athletic",
            ],
            required: true,
        },
        facialLook: {
            type: String,
            enum: [
                "Square",
                "Round Face",
                "Long face with Jawline",
                "Long Face with French Beared",
                "Square Face with Beared",
                "Other",
            ],
            required: true,
        },
        fitness: {
            type: String,
            enum: ["Fit", "Good", "Moderate", "Needs Improvement"],
        },
    },
    availabilityPreferences: {
        travelPreference: {
            type: String,
            enum: ["Domestic", "International"],
            required: true,
        },
        preferredCollaboration: {
            type: String,
            enum: [
                "Commercial Ads and Brand Collaboration ",
                "Remote",
                "In-Person",
                "Hybrid",
            ],
            required: true,
        },
        scheduleFlexibility: {
            type: String,
            enum: ["Flexible", "Fixed", "Negotiable"],
            required: true,
        },
    },
    audienceDemographic: {
        audienceLocation: { type: String },
        audienceInterest: { type: String, enum: ["Entertainment", "Sports"] },
        popularAmongAgeGroup: {
            type: String,
            enum: ["All Age Groups", "Below 18", "18-40", "Above 40"],
            required: true,
        },
    },
    socialMediaPresence: {
        facebookFollowers: { type: Number, default: 0 },
        instagramFollowers: { type: Number, default: 0 },
        linkedinFollowers: { type: Number, default: 0 },
        twitterFollowers: { type: Number, default: 0 },
        snapchatFollowers: { type: Number, default: 0 },
    },
    additionalSkills: {
        musicalTalents: { type: Boolean, default: false },
        danceAbilities: { type: Boolean, default: false },
        actingRange: {
            type: String,
            enum: ["Drama", "Comedy", "Action", "Romantic"],
        },
        publicSpeaking: { type: Boolean, default: false },
    },
    profilePicture: { type: String },
});

export const Profile = mongoose.model("Profile", ProfileSchema);
