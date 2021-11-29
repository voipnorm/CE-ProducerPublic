export default async (str) => {

  try {
    return (JSON.parse(str) && !!str);
  } catch (e) {
    return false;
  }


}
