import { useSelector } from "react-redux";

function UserAuth() {
  const user = useSelector((state: any) => state.auth);

  if (user) {
    return true;
  } else {
    return false;
  }
}

export default UserAuth;
