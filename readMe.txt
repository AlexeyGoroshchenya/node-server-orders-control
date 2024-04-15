заказы:
создание заказа 
эндпоинт http://localhost:5000/api/order/create
POST
ожидаются в body: 
    car: STRING (255),
    model: STRING (255),
    year: STRING (255),
    capacity: STRING (255),
    drive: STRING (255),
    type: STRING (255),
    description: STRING(1000)
	phone: STRING (255)(здесь телефон заказчика в международном формате. например +74955082210)


получение всех заказов 
эндпоинт http://localhost:5000/api/order/allOrders
GET
ожидается токен админа

получение заказа по id заказа
эндпоинт http://localhost:5000/api/order/getById
GET
ожидается действующий токен и в query пареметр id(number)

изменение заказа 
эндпоинт http://localhost:5000/api/order/
PUT
ожидается токен оператора, 
ожидаются в body: 
	orderId: number,
	 status: STRING,
    description: STRING(1000) по ТЗ предполагается что отображается последнее примечание. чтобы не затирать случайно значение,
     предлагаю делать так: при вызове интерфейса  внесения изменений в заказ, 
     отрисовывать в textarea текст из версии description, которая до этого получена с сервера.
     при сохранении изменений отправлять value из textarea. если оператор не трогал примечание, пусть тот же текст отправляется на пересохранение
    


получение заказов по пользовательскому id
эндпоинт http://localhost:5000/api/order/getByUserId
GET
ожидается действующий токен и в query пареметр userId(number)


получение заказов по пользовательскому телефону
эндпоинт http://localhost:5000/api/order/getByUserPhone
GET
ожидается действующий токен и в query пареметр phone (здесь телефон заказчика в международном формате. например +74955082210)

пользователи:
регистрация нового пользователя.
http://localhost:5000/api/user/registration
POST
ожидается токен админа и в body:
name: string,
 phone: number,
 password: string,
 role: string (значения ADMIN, OPERATOR или USER)

вход в систему
http://localhost:5000/api/user/login'
POST
ожидается в body:
 phone: number,
 password: string,

проверка авторизован ли пользователь 
http://localhost:5000/api/user/auth
GET
ожидает действующий токен, отдает новый токен. токен живет сутки

устанавливает временный пароль, который отправляется по смс
http://localhost:5000/api/user/send
POST
ожидается в body:
 phone: number

удаление пользователя
http://localhost:5000/api/user/delete
DELETE
ожидается токен админа в body:
 id: number (id пользователя)

