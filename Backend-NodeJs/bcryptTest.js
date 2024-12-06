const bcrypt = require('bcryptjs');

const testBcrypt = async () => {
  const password = '12345678';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('Original Password:', password);
  console.log('Hashed Password:', hashedPassword);

  const isMatch = await bcrypt.compare(password, hashedPassword);
  console.log('Password match:', isMatch);
};

testBcrypt();
