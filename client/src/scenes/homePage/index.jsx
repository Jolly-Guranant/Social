import { Box, Typography, useMediaQuery } from "@mui/material"
import Navbar from "../navbar";
import { useSelector } from "react-redux";
import UserWidget from "../widgets/UserWidget";
import MyPostWidget from "../widgets/MyPostWidget";
import PostsWidget from "../widgets/PostsWidget";
import FriendlistWidget from "../widgets/FriendListWidget";
import { useEffect, useState } from "react";
import FlexBetween from "../../components/FlexBetween";
import Chat from "../widgets/Chat";

const HomePage = () => {
    const isNonMobileScreens = useMediaQuery("(min-width : 1000px)");
    const {_id, picturePath} = useSelector( (state) =>state.user);
    const [ChatUser , setChatUser ] = useState("");
    const [isChatUser , setIsChatUser ] = useState(false);

    // const getChatUser=(friendId)=>{
    //     setChatUser(friendId);
    //     setisChatUser(true);
    // }
 

    
    return (
        <Box>
            <Navbar/>
            <Box
            width="100%"
            padding="2rem 6%"
            display= {isNonMobileScreens ? "flex" : "block"}
            gap="0.5rem"
            justifyContent="space-between"
            >
                <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
                    <UserWidget userId={_id} picturePath= {picturePath}/>
                </Box>

                <Box flexBasis={isNonMobileScreens ? "42%" : undefined}
                mt={isNonMobileScreens ? undefined : "2rem"}>
                    <MyPostWidget picturePath={picturePath} />
                    <PostsWidget userId={_id} setChatUser={setChatUser} setIsChatUser={setIsChatUser}/>      
                </Box>
                {isNonMobileScreens && (
                            <Box flexBasis="26%">
                            <FriendlistWidget userId={_id} setChatUser={setChatUser} setIsChatUser={setIsChatUser} />
                            </Box>
                )         
                }
                {isChatUser &&(
                    <Chat 
                    friendId={ChatUser}
                    bhang={setIsChatUser}
                    bosda={isChatUser}
                    ></Chat>
                )}

                
            </Box>

        </Box>
    )
}

export default HomePage;