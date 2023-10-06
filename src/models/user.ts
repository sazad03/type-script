import { Model, DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '../db/dbConfig';

class User extends Model {
    public id!: number;
    public username!: string;
    public password!: string;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email : {
            type : DataTypes.STRING,
            allowNull: false,
            unique : true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: 'users', 
        sequelize, 
    }
);

User.sync();

export default User;