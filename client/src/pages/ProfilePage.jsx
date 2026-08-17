import assets from "../assets/chat-app-assets/assets";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
const ProfilePage = () => {
    const { authUser, updateProfile } = useContext(AuthContext);
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    // The actual File selected from the computer
    const [selectedImg, setSelectedImg] = useState("");
    // Base64 preview of the selected image
    const [previewUrl, setPreviewUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    // Load current user information
    useEffect(() => {
        if (authUser) {
            setName(authUser.fullName || "");
            setBio(authUser.bio || "");
        }
    }, [authUser]);
    // Handle selecting an image
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        // Check file type
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            e.target.value = "";
            return;
        }
        // Check file size
        if (file.size > 5 * 1024 * 1024) {
            alert("Please select an image smaller than 5 MB.");
            e.target.value = "";
            return;
        }
        // Store the actual File
        setSelectedImg(file);
        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
            setPreviewUrl(reader.result);
        };
        reader.onerror = () => {
            alert("Unable to read the selected image.");
            setSelectedImg(null);
            setPreviewUrl("");
        };
        reader.readAsDataURL(file);
    };
    // Submit profile
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!authUser) {
            alert("User information is not available.");
            return;
        }
        if (!name.trim()) {
            alert("Please enter your name.");
            return;
        }
        if (!bio.trim()) {
            alert("Please enter your bio.");
            return;
        }
        try {
            setIsSaving(true);

            const updateData = {
                fullName: name.trim(),
                bio: bio.trim(),
            };

            // If the user selected an image,
            // convert it to Base64 before sending it.
            if (selectedImg) {
                const reader = new FileReader();

                const base64Image = await new Promise(
                    (resolve, reject) => {
                        reader.onload = () => {
                            resolve(reader.result);
                        };
                        reader.onerror = () => {
                            reject(
                                new Error(
                                    "Failed to read image."
                                )
                            );
                        };
                        reader.readAsDataURL(selectedImg);
                    }
                );
                updateData.profilePic = base64Image;
            }
            console.log("Sending profile update:", {
                fullName: updateData.fullName,
                bio: updateData.bio,
                hasProfilePic: Boolean(updateData.profilePic),
            });
            // updateProfile should return true when backend succeeds
            const success = await updateProfile(updateData);
            if (success) {
                navigate("/");
            }
        } catch (error) {
            console.error(
                "Profile update error:",
                error
            );
            alert(
                error?.message || "Failed to update profile."
            );
        } finally {
            setIsSaving(false);
        }
    };
    // Wait until authUser is available
    if (!authUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading profile...</p>
            </div>
        );
    }
    // Image priority:
    // 1. Newly selected image
    // 2. Existing Cloudinary image
    // 3. Default avatar
    const displayedImage = previewUrl ||authUser.profilePic ||assets.avatar_icon;
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-2xl backdrop-blur-2xl  text-black  border-2 border-[#25223b]
             flex  items-center justify-between max-sm:flex-col-reverse  rounded-lg overflow-hidden">
                {/* LEFT SIDE */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 p-10 flex-1 w-full">
                    <h3 className="text-lg font-medium"> Profile Details </h3>
                    {/* IMAGE UPLOAD */}
                    <label
              htmlFor="avatar"className=" flex items-center gap-3 cursor-pointer ">
                        <input
                            type="file" id="avatar"
                            accept="image/png,image/jpeg,image/jpg"
                            hidden
                            onChange={handleImageChange}/>
                        <img src={displayedImage} alt="Profile"
                className=" w-14 h-14 rounded-full object-cover border border-gray-400 "/>
                        <span className="text-sm">
                         Upload Profile Image
                        </span>
                    </label>
                    {/* NAME */}
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"  required
             className="p-3 border border-gray-500 rounded-md
             outline-none focus:ring-2 focus:ring-violet-600 "/>
                    {/* BIO */}
                    <textarea value={bio} onChange={(e) => setBio(e.target.value) }
                        placeholder="Write profile bio"  required rows={4}
                        className=" p-3 border  border-gray-500 rounded-md
                     outline-none focus:ring-2 focus:ring-violet-500 resize-none "
                    />
                    {/* SAVE */}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="
                            bg-linear-to-r
                            from-purple-500
                            to-violet-800
                            text-white
                            p-3
                            rounded-full
                            text-lg
                            cursor-pointer
                            disabled:opacity-50
                            disabled:cursor-not-allowed ">
                        {isSaving ? "Saving..."  : "Save"}
                    </button>
                </form>
                {/* RIGHT SIDE */}
                <div className="flex items-center justify-center">
                    <img src={displayedImage} alt="Profile"
                    className=" w-44 h-44 rounded-full
  mx-10  max-sm:mt-10  max-sm:mb-10 object-cover border-2 border-gray-400"/>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;