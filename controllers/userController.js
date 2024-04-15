const ApiError = require('../error/ApiError')
var smsc = require('../smsc/smsc_api.js');
const generatePassword = require('../utils/utils')


const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User, Order } = require('../models/models')
const { json } = require('sequelize')

const generateGWT = (id, phone, role) => {
        return jwt.sign({ id: id, phone: phone, role: role },
                process.env.SECRET_KEY,
                { expiresIn: '24h' }
        )
}

class UserController {

        async registration(req, res, next) {

                const { name, phone, password, role } = req.body

                if (!name || !phone || !password) {
                        return next(ApiError.badRequest('проверьте имя, телефон и пароль'))
                }

                if (role !== 'ADMIN' || role !== 'OPERATOR' || role !== 'USER') {
                        return next(ApiError.badRequest('проверьте роль пользователя'))
                }

                try {

                        const candidate = await User.findOne({ where: { phone } })
                        if (candidate) {
                                return next(ApiError.badRequest('пользователь с таким номером уже зарегистрирован'))
                        }

                        const hashPassword = await bcrypt.hash(password, 5)

                        const user = await User.create({ name, phone, password: hashPassword, role: role })

                        const token = generateGWT(user.id, user.phone, user.role)

                        return res.json({ token })
                } catch (error) {
                        return next(ApiError.internal('ошибка создания пользователя: ' + error))
                }
        }

        async login(req, res, next) {

                const { phone, password } = req.body
                try {
                        const user = await User.findOne({ where: { phone } })
                        if (!user) {
                                return next(ApiError.badRequest('пользователь не найден'))
                        }

                        let comparePassword = bcrypt.compareSync(password, user.password)
                        if (!comparePassword) {
                                return next(ApiError.badRequest('неправильный пароль'))
                        }
                        const token = generateGWT(user.id, user.phone, user.role)

                        if (user.role !== 'ADMIN') {
                                const hashPassword = await bcrypt.hash(generatePassword(), 5)
                                user.password = hashPassword
                                user.save()
                        }

                        return res.json({ token })
                } catch (error) {
                        return next(ApiError.internal('ошибка авторизации: ' + error))
                }

        }



        async check(req, res, next) {

                try {
                        const token = generateGWT(req.user.id, req.user.phone, req.user.role)
                        return res.json({ token })
                } catch (error) {
                        return next(ApiError.internal('ошибка авторизации: ' + error))
                }
        }

        async deleteUser(req, res, next) {

                const { id } = req.body
                if (!id) return next(ApiError.badRequest('проверьте данные id'))

                try {
                        await User.destroy({
                                where: {
                                        id: id
                                }
                        })

                        return res.json({ result: "ok" })
                } catch (error) {
                        return next(ApiError.internal('ошибка удаления пользователя: ' + error))
                }
        }

        async sendPassword(req, res, next) {
                const { phone } = req.body
                const message = Math.ceil(Math.random() * 1000000)

                const hashPassword = await bcrypt.hash(`${message}`, 5)

                let user

                try {
                        user = await User.findOne({ where: { phone } })

                        smsc.send_sms({
                                phones: [phone],
                                mes: message
                        }, function (data, raw, err, code) {
                                if (err) return console.log(err, 'code: ' + code);
                                console.log(data); // object
                                console.log(raw); // string in JSON format

                                user.password = `${hashPassword}`
                                user.save()

                                setTimeout(() => {
                                        smsc.get_status({
                                                phones: phone,
                                                id: data.id,
                                                all: 1
                                        }, function (status, raw, err, code) {
                                                if (err) return console.log(err, 'code: ' + code);
                                                console.log(status);
                                        });
                                }, 60000
                                )
                        });

                        return res.json({ result: 'ok' })

                } catch (error) {
                        return next(ApiError.internal('ошибка назначения временного пароля: ' + error))
                }
        }

}
module.exports = new UserController()