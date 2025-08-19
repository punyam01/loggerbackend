import mongoose from 'mongoose'

export const dbConnect = async () => {
  try {
    // Use default values if environment variables are not set
    const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'hairCareLog';
    
    const connectionInstance = await mongoose.connect(
      `${dbUrl}/${dbName}`
    )
    console.log(`Database connected: ${mongoose.connection.db.databaseName}`)
  } catch (error) {
    console.log(`DATABASE CONNECTION FAILED!!:`, error)
    console.log('Please make sure MongoDB is running on your system')
  }
}
