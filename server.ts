import dotenv from 'dotenv';
import sequelize from './database/connection';
import app from './src/app';

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 4000;

sequelize
  .authenticate()
  .then(() => {
    console.log('database connected successfully');
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
