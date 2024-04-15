const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    phone:{type: DataTypes.BIGINT, unique: true},
    password:{type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: 'USER'}
})


const Order = sequelize.define('order', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    car: {type: DataTypes.STRING, allowNull: false},
    model: {type: DataTypes.STRING, allowNull: false},
    year: {type: DataTypes.STRING, allowNull: false},
    capacity: {type: DataTypes.STRING, allowNull: false},
    drive: {type: DataTypes.STRING, allowNull: false},
    type: {type: DataTypes.STRING, allowNull: false},
    status: {type: DataTypes.STRING, allowNull: true},
    description: {type: DataTypes.STRING(1000), allowNull: false}   
})

// const Status = sequelize.define('status', {
//     id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
//     name: {type: DataTypes.STRING, allowNull: false},
//     description: {type: DataTypes.STRING, allowNull: true},
// })









User.hasMany(Order)
Order.belongsTo(User)






module.exports = {

    User,
    Order
}