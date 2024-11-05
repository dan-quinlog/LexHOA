import { fetchAuthSession } from '@aws-amplify/auth';

export const searchUsers = async (filter) => {
  const { accessToken } = await fetchAuthSession();
  
  const response = await fetch(`/api/users/search?filter=${filter}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  return response.json();
};
