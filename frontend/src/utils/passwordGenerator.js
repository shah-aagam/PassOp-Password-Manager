export function generatePassword({
  length = 16,
  numbers = true,
  symbols = true,
} = {}) {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const syms = "!@#$%^&*()_+[]{}<>?";

  let chars = letters;
  if (numbers) chars += nums;
  if (symbols) chars += syms;

  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return password;
}
