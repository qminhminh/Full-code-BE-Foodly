const FeedBack = require("../models/FeedBack");
const Profile = require("../models/Profile");
const User = require("../models/User");
const admin = require('firebase-admin');

module.exports = {

    updateUser: async (req, res) => {
        if (req.body.password) {
            req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET).toString();
        }
        try {
            const updatedUser = await User.findByIdAndUpdate(
                req.user.id, {
                $set: req.body
            }, { new: true });
            const { password, __v, createdAt, ...others } = updatedUser._doc;

            res.status(200).json({ ...others });
        } catch (err) {
            res.status(500).json(err)
        }
    },

    deleteUser: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.user.id)
            res.status(200).json("Successfully Deleted")
        } catch (error) {
            res.status(500).json({status: false, message: error.message})
        }
    },

    verifyAccount: async (req, res) => {
        const providedOtp = req.params.otp
        try {
            
            const user = await User.findById(req.user.id);

            if(!user){
                return res.status(404).json({status: false, message: 'User not found'})
            }
    
            // Check if user exists and OTP matches
            if (user.otp === providedOtp) {
                // Update the verification field
                user.verification = true;
                user.otp = 'none'; // Optionally reset the OTP
                await user.save();
    
                const { password, __v, otp, createdAt, ...others } = user._doc;
                return res.status(200).json({ ...others });
            } else {
                return res.status(400).json({status: false, message: 'OTP verification failed'});
            }
        } catch (error) {
            res.status(500).json({status: false, message: error.message });
        }
    },

    verifyPhone: async (req, res) => {
        const phone = req.params.phone
        try {
            
            const user = await User.findById(req.user.id);

            if(!user){
                return res.status(404).json({status: false, message: 'User not found'})
            }
    
            user.phoneVerification = true;
            user.phone = phone; // Optionally reset the OTP
            await user.save();

            const { password, __v, otp, createdAt, ...others } = user._doc;
            return res.status(200).json({ ...others });

        } catch (error) {
            res.status(500).json({status: false, message: error.message });
        }
    },

  
    getUser: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).populate('address');
            const { password, __v, createdAt, ...userdata } = user._doc;
            res.status(200).json(userdata)
        } catch (error) {
            res.status(500).json(error)
        }
    },

    getAdminNumber: async (req, res) => {
        try {
            const adminNumber = await User.find({userType: "Admin"}, {phone: 1});

            res.status(200).json(adminNumber[0]['phone'])
        } catch (error) {
            res.status(500).json({status: false, message: error.message})
        }
    },

    userFeedback: async (req, res) => {
        const id = req.user.id
        try {
            const feedback = new FeedBack({
                userId: id,
                message: req.body.message,
                imageUrl: req.body.imageUrl,
            })
            await feedback.save()

            res.status(201).json({status: true, message:"Feedback submitted successfully"})
        } catch (error) {
            res.status(500).json({status: false, message: error.message})
        }
    },


    getAllUsers: async (req, res) => {
        try {
            const allUser = await User.find();

            res.status(200).json(allUser)
        } catch (error) {
            res.status(500).json(error)
        }
    },


    updateFcm: async (req, res) => {
        const token = req.params.token;

        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ status: false, message: 'User not found' });
            }

            user.fcm = token;

            if(user.userType == 'Driver'){
                await admin.messaging().subscribeToTopic(user.fcm, "delivery");
            }

            await user.save();
            return res.status(200).json({ status: true, message: 'FCM token updated successfully' });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
     },
     getAllUsersMessage: async (req, res) => {
      
        try {
            const drivers = await User.find({userType: "Client" })
            .select("-fcm -otp -password -createdAt -updatedAt -__v");
            console.log(drivers);
            res.status(200).json(drivers);
        } catch (error) {
            res.status(500).json(error);
        }
    },
    getAllRestaurants: async (req, res) => {
      
        try {
            const drivers = await User.find({userType: "Vendor" })
            .select("-fcm -otp -password -createdAt -updatedAt -__v");
            console.log(drivers);
            res.status(200).json(drivers);
        } catch (error) {
            res.status(500).json(error);
        }
    },
    updateProfileRestaurants: async (req, res) => {
        const { id, name, phone, status, image, gender, birthday } = req.body; // corrected "birthay" to "birthday"
    
        try {
            // Check if the profile exists
            const existingProfile = await Profile.findOne({ userID: id });
            
            if (!existingProfile) {
                // Create a new profile if it doesn't exist
                const newProfile = new Profile({
                    userID: id,
                    username: name,
                    status: status,
                    phone: phone,
                    profile: image,
                    gender: gender,
                    birthday: birthday
                });
                await newProfile.save();

                await User.findByIdAndUpdate(
                    id, // Directly use the user ID
                    {
                        profile: image, // Ensure 'profile' is the correct field name you want to update
                    },
                    { new: true } // Return the updated profile
                );
                
                return res.status(200).json(newProfile); // Return the newly created profile
            } else {
                // Update the existing profile
                const updatedProfile = await Profile.findOneAndUpdate(
                    { userID: id },
                    {
                        username: name,
                        status: status,
                        phone: phone,
                        profile: image,
                        gender: gender,
                        birthday: birthday
                    },
                    { new: true } // Return the updated profile
                );

                await User.findByIdAndUpdate(
                    id, // Directly use the user ID
                    {
                        profile: image, // Ensure 'profile' is the correct field name you want to update
                    },
                    { new: true } // Return the updated profile
                );
                return res.status(200).json(updatedProfile); // Return the updated profile
            }
        } catch (error) {
            console.error(error); // Log the error for debugging
            return res.status(500).json({ message: 'Internal Server Error', error }); // Return a generic error message
        }
    },
    updateProfileCus: async (req, res) => {
        const { id, name, phone, status, image, gender, birthday } = req.body; // corrected "birthay" to "birthday"
    
        try {
            // Check if the profile exists
            const existingProfile = await Profile.findOne({ userID: id });
            
            if (!existingProfile) {
                // Create a new profile if it doesn't exist
                const newProfile = new Profile({
                    userID: id,
                    username: name,
                    status: status,
                    phone: phone,
                    profile: image,
                    gender: gender,
                    birthday: birthday
                });
                await newProfile.save();

                await User.findByIdAndUpdate(
                    id, // Directly use the user ID
                    {
                        profile: image, // Ensure 'profile' is the correct field name you want to update
                    },
                    { new: true } // Return the updated profile
                );
                
                return res.status(200).json(newProfile); // Return the newly created profile
            } else {
                // Update the existing profile
                const updatedProfile = await Profile.findOneAndUpdate(
                    { userID: id },
                    {
                        username: name,
                        status: status,
                        phone: phone,
                        profile: image,
                        gender: gender,
                        birthday: birthday
                    },
                    { new: true } // Return the updated profile
                );

                await User.findByIdAndUpdate(
                    id, // Directly use the user ID
                    {
                        profile: image, // Ensure 'profile' is the correct field name you want to update
                    },
                    { new: true } // Return the updated profile
                );
                return res.status(200).json(updatedProfile); // Return the updated profile
            }
        } catch (error) {
            console.error(error); // Log the error for debugging
            return res.status(500).json({ message: 'Internal Server Error', error }); // Return a generic error message
        }
    },
    updateProfileDriver: async (req, res) => {
        const { id, name, phone, status, image, gender, birthday } = req.body; // corrected "birthay" to "birthday"
    
        try {
            // Check if the profile exists
            const existingProfile = await Profile.findOne({ userID: id });
            
            if (!existingProfile) {
                // Create a new profile if it doesn't exist
                const newProfile = new Profile({
                    userID: id,
                    username: name,
                    status: status,
                    phone: phone,
                    profile: image,
                    gender: gender,
                    birthday: birthday
                });
                await newProfile.save();

                await User.findByIdAndUpdate(
                    id, // Directly use the user ID
                    {
                        profile: image, // Ensure 'profile' is the correct field name you want to update
                    },
                    { new: true } // Return the updated profile
                );
                
                return res.status(200).json(newProfile); // Return the newly created profile
            } else {
                // Update the existing profile
                const updatedProfile = await Profile.findOneAndUpdate(
                    { userID: id },
                    {
                        username: name,
                        status: status,
                        phone: phone,
                        profile: image,
                        gender: gender,
                        birthday: birthday
                    },
                    { new: true } // Return the updated profile
                );

                await User.findByIdAndUpdate(
                    id, // Directly use the user ID
                    {
                        profile: image, // Ensure 'profile' is the correct field name you want to update
                    },
                    { new: true } // Return the updated profile
                );
                return res.status(200).json(updatedProfile); // Return the updated profile
            }
        } catch (error) {
            console.error(error); // Log the error for debugging
            return res.status(500).json({ message: 'Internal Server Error', error }); // Return a generic error message
        }
    },
    getProfileRestaurants: async (req, res) => {
        const id = req.params.id;
    
        try {
            // Check if the profile exists
            const profile = await Profile.findOne({ userID: id });
            
            if (profile) {
                return res.status(200).json({ profile: profile }); 
                
            }
        } catch (error) {
            console.error(error); // Log the error for debugging
            return res.status(500).json({ message: 'Internal Server Error', error }); // Return a generic error message
        }
    },
    getProfileCustomer: async (req, res) => {
        const id = req.params.id;
    
        try {
            // Check if the profile exists
            const profile = await Profile.findOne({ userID: id });
            
            if (profile) {
                return res.status(200).json({ profile: profile }); 
                
            }
        } catch (error) {
            console.error(error); // Log the error for debugging
            return res.status(500).json({ message: 'Internal Server Error', error }); // Return a generic error message
        }
    },
    getProfileDriver: async (req, res) => {
        const id = req.params.id;
    
        try {
            // Check if the profile exists
            const profile = await Profile.findOne({ userID: id });
            
            if (profile) {
                return res.status(200).json({ profile: profile }); 
                
            }
        } catch (error) {
            console.error(error); // Log the error for debugging
            return res.status(500).json({ message: 'Internal Server Error', error }); // Return a generic error message
        }
    },
    
    
}