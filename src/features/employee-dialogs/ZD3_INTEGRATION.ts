/**
 * ЗД №3 Integration Guide
 * 
 * Этот файл демонстрирует как работает поток создания сотрудника
 * с обработкой конфликтов и ошибок 500
 */

/**
 * СЦЕНАРИЙ 1: Успешное создание нового сотрудника
 * 
 * Шаги:
 * 1. Пользователь открывает диалог "Добавить сотрудника"
 * 2. Заполняет форму и нажимает "Сохранить"
 * 3. POST /api/v1/employees отправляет payload
 * 4. Сервер возвращает 201 + Employee object
 * 5. Диалог закрывается
 * 6. Видно snackbar "Сотрудник добавлен"
 * 7. Таблица сотрудников обновляется
 */

/**
 * СЦЕНАРИЙ 2: Создание - пользователь существует (USER_EXISTS)
 * 
 * Шаги:
 * 1. POST /api/v1/employees вернул 400
 * 2. Backend прислал:
 *    {
 *      "message": "Пользователь с таким номером уже существует",
 *      "userId": 123,
 *      "existingUser": { userId, firstName, lastName, phoneNumber, iin },
 *      "conflictType": "USER_EXISTS"  // или определяется по message
 *    }
 * 3. CreateEmployeeDialog ловит ошибку
 * 4. determineConflictScenario() возвращает "USER_EXISTS"
 * 5. Показывается ExistingUserDialog с данными пользователя
 * 
 * Вариант 2a: Пользователь нажимает "Да, это он"
 * - handleExistingUserConfirm() вызывает confirmExistingUser(123, payload)
 * - POST /api/v1/employees/confirm-existing/123 отправляет данные формы
 * - Сервер возвращает 201 + новый Employee
 * - Диалог закрывается, snackbar "Сотрудник добавлен", таблица обновляется
 * 
 * Вариант 2b: Пользователь нажимает "Нет, это не он, отобрать номер"
 * - handleTakePhone() вызывает takePhoneAndCreate(123, payload)
 * - POST /api/v1/employees/take-phone-create/123 отправляет данные
 * - Сервер отбирает номер у existing user и создает нового сотрудника
 * - Диалог закрывается, snackbar "Сотрудник добавлен", таблица обновляется
 */

/**
 * СЦЕНАРИЙ 3: Создание - сотрудник существует (EMPLOYEE_EXISTS)
 * 
 * Шаги:
 * 1. POST /api/v1/employees вернул 400
 * 2. Backend прислал:
 *    {
 *      "message": "Сотрудник с таким номером телефона уже существует",
 *      "userId": 456,
 *      "existingUser": { userId, firstName, lastName, phoneNumber, iin },
 *      "conflictType": "EMPLOYEE_EXISTS"  // или определяется по message
 *    }
 * 3. CreateEmployeeDialog ловит ошибку
 * 4. determineConflictScenario() возвращает "EMPLOYEE_EXISTS"
 * 5. Показывается EmployeeExistsDialog с данными сотрудника
 * 
 * Вариант 3a: Пользователь нажимает "Да, это он"
 * - handleEmployeeExistsConfirm() показывает RefusalDialog
 * - RefusalDialog отображает текст "Вам нужно найти этого сотрудника..."
 * - Пользователь нажимает "Закрыть"
 * - Все диалоги закрываются, пользователь возвращается на главную
 * 
 * Вариант 3b: Пользователь нажимает "Нет, это не он, отобрать номер"
 * - handleTakePhone() вызывает takePhoneAndCreate(456, payload)
 * - POST /api/v1/employees/take-phone-create/456 отправляет данные
 * - Сервер отбирает номер и создает нового сотрудника
 * - Диалог закрывается, snackbar "Сотрудник добавлен", таблица обновляется
 */

/**
 * СЦЕНАРИЙ 4: Ошибка 500 при confirm-existing (КРИТИЧЕСКИЙ)
 * 
 * Шаги:
 * 1. POST /api/v1/employees вернул 400 (USER_EXISTS)
 * 2. Показывается ExistingUserDialog
 * 3. Пользователь нажимает "Да, это он"
 * 4. handleExistingUserConfirm() вызывает confirmExistingUser()
 * 5. isSubmitting = true, кнопка показывает loading (CircularProgress)
 * 6. POST /api/v1/employees/confirm-existing/123 отправляется
 * 7. СЕРВЕР ВОЗВРАЩАЕТ 500:
 *    {
 *      "error": "Внутренняя ошибка сервера",
 *      "message": "Произошла непредвиденная ошибка",
 *      "status": 500
 *    }
 * 8. confirmExistingUser() выбрасывает Error с message
 * 9. handleExistingUserConfirm() ловит ошибку в catch блоке
 * 10. enqueueSnackbar(error.message, { variant: 'error' })
 * 11. isSubmitting = false
 * 
 * ВАЖНО: setConflictState() НЕ вызывается в catch!
 * - Диалог ОСТАЕТСЯ ОТКРЫТЫМ
 * - Пользователь видит error snackbar
 * - Пользователь может нажать "Да, это он" еще раз
 * - UI НЕ ПАДАЕТ
 */

/**
 * СЦЕНАРИЙ 5: Нет данных от бэка (edge case)
 * 
 * Шаги:
 * 1. POST /api/v1/employees вернул 400
 * 2. Backend прислал только message БЕЗ userId/existingUser:
 *    {
 *      "message": "Какая-то ошибка конфликта",
 *      "status": 400
 *    }
 * 3. CreateEmployeeDialog ловит ошибку
 * 4. hasValidExistingUserData() возвращает false
 * 5. enqueueSnackbar("Бэк не вернул данные существующего пользователя", warning)
 * 6. setConflictState() с existingUser: null
 * 7. ExistingUserDialog/EmployeeExistsDialog показывает только errorMessage
 * 8. Кнопка "Да, это он" остается доступной
 * 9. Пользователь может попробовать снова или закрыть диалог
 */

/**
 * ТИПИЗАЦИЯ ОШИБОК
 * 
 * EmployeesConflictError (для 400 конфликтов)
 * {
 *   status: 400,
 *   message: string,
 *   userId?: number,
 *   existingUser?: ExistingUserInfo,
 *   conflictType?: 'USER_EXISTS' | 'EMPLOYEE_EXISTS'
 * }
 * 
 * Error (для других ошибок, включая 500)
 * {
 *   message: string  // из ответа сервера или default
 * }
 */

/**
 * ОБРАБОТЧИКИ В CreateEmployeeDialog
 * 
 * handleExistingUserConfirm():
 *   - Вызывается при нажатии "Да, это он" в ExistingUserDialog
 *   - setIsSubmitting(true)
 *   - confirmExistingUser(userId, payload)
 *   - success: close dialogs + snackbar + onSuccess()
 *   - error: snackbar (диалог остается открытым!)
 * 
 * handleEmployeeExistsConfirm():
 *   - Вызывается при нажатии "Да, это он" в EmployeeExistsDialog
 *   - setShowRefusal(true) → показывает RefusalDialog
 * 
 * handleTakePhone():
 *   - Вызывается при нажатии "Нет, это не он, отобрать номер"
 *   - setIsSubmitting(true)
 *   - takePhoneAndCreate(userId, payload)
 *   - success: close dialogs + snackbar + onSuccess()
 *   - error: snackbar (диалог остается открытым!)
 */

export const ZD3_Integration = {}
