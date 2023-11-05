const sanitise = (response: string) => {
  try {
    // Not sure why it always leaves out the open curly bracket, but this fixes it
    const jsonData = JSON.parse(`{${response}`);
    if (typeof jsonData !== "object") return "not valid object";
    return jsonData;
  } catch {
    return "not valid object";
  }
};

export default sanitise;
