import {
    EditOutlined,
    DeleteOutlined,
    AttachFileOutlined,
    GifBoxOutlined,
    ImageOutlined,
    MicOutlined,
    MoreHorizOutlined
} from "@mui/icons-material";
import { Box,
 Divider, 
 Typography, 
 InputBase, 
 useTheme, 
 Button, 
 IconButton, 
 useMediaQuery 
} from "@mui/material";
import FlexBetween from "../../components/FlexBetween";
import Dropzone from "react-dropzone"
import UserImage from "../../components/UserImage";
import WidgetWrapper from "../../components/WidgetWraper";
import { useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import { setPosts } from "../../state";

const MyPostWidget= ({ picturePath })=> {
    const dispatch = useDispatch();
    const [isImage,setIsImage] = useState(false);
    const [image, setImage] = useState(null);
    const [post,setPost] = useState("");
    const { palette} = useTheme();
    const { _id} = useSelector((state)=> state.user);
    const token = useSelector((state)=> state.token);
    const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
    const mediumMain = palette.neutral.mediumMain;
    const medium = palette.neutral.medium;

    const handlePost = async() => {
        try {
            // Debug logging
            console.log("Starting post...");
            console.log("Token:", token);
            console.log("User ID:", _id);
            
            const formData = new FormData();
            formData.append("userId", _id);
            formData.append("description", post);
            
            if(image) {
                formData.append("picture", image); // Direct file object, not Blob
                console.log("Image being uploaded:", image.name);
            }
            // formData.append("picturePath", image.name);

            // Debug FormData
            for (let pair of formData.entries()) {
                console.log('FormData content:', pair[0], pair[1]);
            }

            // Check server availability
            try {
                await fetch('http://localhost:3001');
                console.log("Server is reachable");
            } catch (e) {
                console.error("Server is not reachable:", e);
                return;
            }

            const response = await fetch(`http://localhost:3001/posts`, {
                method: "POST",
                headers: { 
                    Authorization: `Bearer ${token}`
                    // Don't set Content-Type - browser will set it automatically for FormData
                },
                credentials: 'include', // Important for CORS
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const posts = await response.json();
            // console.log("Response received:", posts);

            dispatch(setPosts({ posts }));
            setImage(null);
            setPost("");
            setIsImage(false);

        } catch (error) {
            console.error("Error details:", {
                message: error.message,
                stack: error.stack,
                error
            });
        }
    };

    return (
        <WidgetWrapper>
            <FlexBetween gap="1.5rem">
                <UserImage image={picturePath}/>
                <InputBase 
                placeholder="Whats on ur mind"
                onChange={(e) => setPost(e.target.value)}
                value={post}
                sx={{
                    width: "100%",
                    backgroundColor : palette.neutral.light,
                    borderRadius: "2rem",
                    padding: "1rem 2rem"
                }}
                />
                </FlexBetween>

                {isImage && (
                    <Box 
                    border = {`1px solid ${medium}`}
                    borderRadius="5px"
                    mt="1rem"
                    p="1rem"
                    >
                < Dropzone
                acceptedFiles=".jpg,.jpeg,.png"
                multiple={false}
                onDrop={(acceptedFiles) =>setImage(acceptedFiles[0])
                }
                >
                    {({ getRootProps, getInputProps }) => (
                        <FlexBetween>

                        <Box
                            {...getRootProps()}
                            border={`2px dashed ${palette.primary.main}`}
                            p="1rem"
                            width="100%"
                            sx={{ "&:hover": { cursor: "pointer" } }}
                            >
                            <input {...getInputProps()} />
                            {!image ? (
                                <p> Add Image Here </p>
                            ) : (
                                <FlexBetween>
                                    <Typography>
                                        {image.name}
                                    </Typography>
                                    <EditOutlined />
                                </FlexBetween>
                            )}

                        </Box>
                        {image && (
                            <IconButton
                            onClick={()=> setImage(null)}
                            sx={{width:"15%"}}
                            >
                                <DeleteOutlined/>
                            </IconButton>
                        )}
                    </FlexBetween>
                    )}
                            </Dropzone>
                    </Box>
                )}

                <Divider sx={{margin:"1.25rem 0"}}/>

                <FlexBetween>
                    <FlexBetween gap="0.25rem" onClick={()=> setIsImage(!isImage)}>
                        <ImageOutlined sx={{color:mediumMain}}/>
                        <Typography 
                        color={mediumMain}
                        sx={{ "&:hover" : {cursor: "pointer", color: medium}}}
                        >
                            Image
                        </Typography>
                    </FlexBetween>

                    {isNonMobileScreens ? (
                        <>
                        <FlexBetween gap="0.25rem">
                            <GifBoxOutlined sx={{color:mediumMain}}/>
                            <Typography color={mediumMain} >Clip</Typography>
                        </FlexBetween>

                        <FlexBetween gap="0.25rem">
                            <AttachFileOutlined sx={{color:mediumMain}}/>
                            <Typography color={mediumMain} >Attachment</Typography>
                        </FlexBetween>
                        
                        <FlexBetween gap="0.25rem">
                            <MicOutlined sx={{color:mediumMain}}/>
                            <Typography color={mediumMain} >Audio</Typography>
                        </FlexBetween>

                        </>
                    ) : 
                    (
                    <FlexBetween gap="0.25rem">
                        <MoreHorizOutlined sx={{color:mediumMain}}/>
                    </FlexBetween>
                    )}

                    <Button disabled={!post}
                    onClick={handlePost}
                    sx={{
                        color:palette.background.alt,
                        backgroundColor: palette.primary.main,
                        borderRadius : "3rem"
                    }}
                    >
                        POST
                        </Button>
                </FlexBetween>
        </WidgetWrapper>
    )
}; 

export default MyPostWidget;