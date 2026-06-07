export const generateCode = () => {
  let code = '';

  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 6) + 1;
  }

  return code;
};
