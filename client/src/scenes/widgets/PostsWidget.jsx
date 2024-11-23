import { useEffect } from "react";
import { useDispatch,useSelector } from "react-redux";
import { setPosts } from "../../state";
import PostWidget from "./PostWidget";
import { Box } from "@mui/material";

const PostsWidget = ({userId ,setChatUser,setIsChatUser ,isProfile =false}) =>{
    const dispatch = useDispatch();
    const posts = useSelector((state) => state.posts);
    const token = useSelector((state)=> state.token);

    const getPosts = async()=> {
        const response = await fetch("http://localhost:3001/posts",{
            method: "GET",
            headers: {Authorization:`Bearer ${token}`},
        });
        const data = await response.json();
        dispatch(setPosts({posts : data}));
    }

    const getUserPosts = async()=> {
        const response = await fetch(`http://localhost:3001/posts/${userId}`,{
            method: "GET",
            headers: {Authorization:`Bearer ${token}`},
        });
        const data = await response.json();
        dispatch(setPosts({posts : data}));
    };
    useEffect(()=>{
        if(isProfile){
            getUserPosts();
        }else{
            getPosts();
        }
    } , [])//eslint-diable-line
    
    return (  <Box
        sx={{
            height: "calc(100vh - 80px)", // Adjust the height based on your navbar height
            overflowY: "auto",
            paddingRight: "1rem", // Add some padding for the scrollbar
            "&::-webkit-scrollbar": {
                width: "8px",
            },
            "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
                background: "#888",
                borderRadius: "10px",
                "&:hover": {
                    background: "#555",
                },
            },
            // For Firefox
            scrollbarWidth: "thin",
            scrollbarColor: "#888 #f1f1f1",
        }}
    >
        <Box sx={{ paddingBottom: "1rem" }}> {/* Add padding at the bottom for better spacing */}
            {posts.toReversed().map(({
                _id,
                userId,
                firstName,
                lastName,
                description,
                location,
                picturePath,
                userPicturePath,
                likes,
                comments,
            }) => (
                <PostWidget
                    key={_id}
                    postId={_id}
                    postUserId={userId}
                    name={`${firstName} ${lastName}`}
                    description={description}
                    location={location}
                    picturePath={picturePath}
                    userPicturePath={userPicturePath}
                    likes={likes}
                    comments={comments}
                    setChatUser={setChatUser}
                    setIsChatUser={setIsChatUser}
                    isProfile={isProfile}
                />
            ))}
        </Box>
    </Box>
)
};

export default PostsWidget;