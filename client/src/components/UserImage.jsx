import { Box} from "@mui/material";

const UserImage= ({ image,size="60px"}) => {
    const isUrl = (str) => {
        try {
          new URL(str);
          return true;
        } catch (_) {
          return false;
        }
      };
    const src = isUrl(image) ? image : `http://localhost:3001/assets/${image}`;
    return (
        <Box 
            width = {size} height ={ size}
        >
            <img style = {{ objectFit : "cover" , borderRadius: "50%"}}
            width ={size} height = {size} 
            alt="user"
            // src={`http://localhost:3001/assets/${image}`}
            src={src}
            ></img>

        </Box>
    )
}

export default UserImage;