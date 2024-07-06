import { signInSuccess, signInFailure } from '../redux/user/userSlice';

export const retrieveUserData = async (dispatch, accessToken) => {

    console.log(accessToken);
    if (!accessToken) return;

  try {
    const response = await fetch('/api/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (response.ok) {
      const userData = await response.json();
      console.log(userData);
    } else {
      const errorData = await response.json();
      dispatch(signInFailure(errorData.message));
    }
  } catch (error) {
    dispatch(signInFailure(error.message));
  }
};
