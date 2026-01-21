# 📋 Инструкция для бэка — ЗД №4

**Статус**: Готово к реализации  
**Приоритет**: Опциональный (фронт уже работает без этих полей)  
**Benefit**: Лучший UX — пользователь видит данные конфликтующего пользователя/сотрудника

---

## TL;DR

Добавьте 3 новых поля в 400-ответ при конфликте:
- `userId: number`
- `existingUser: { userId, firstName, lastName, phoneNumber, iin }`
- `conflictType: "USER_EXISTS" | "EMPLOYEE_EXISTS"`

После этого фронт **автоматически** начнёт показывать красивые диалоги с данными.

---

## 📌 Что нужно изменить

### Структура ответа

**Было** (текущее):
```json
HTTP 400
{
  "error": "Bad Request",
  "message": "Пользователь с таким номером уже существует",
  "status": 400,
  "timestamp": "2026-01-22T12:00:00Z",
  "path": "/api/v1/employees"
}
```

**Нужно** (расширенное):
```json
HTTP 400
{
  "error": "Bad Request",
  "message": "Пользователь с таким номером уже существует",
  "status": 400,
  "timestamp": "2026-01-22T12:00:00Z",
  "path": "/api/v1/employees",
  
  // ← НОВЫЕ ПОЛЯ
  "userId": 42,
  "existingUser": {
    "userId": 42,
    "firstName": "Иван",
    "lastName": "Иванов",
    "phoneNumber": "+7 (700) 123-45-67",
    "iin": "850101123456"
  },
  "conflictType": "USER_EXISTS"
}
```

---

## 🔧 Реализация

### 1️⃣ Создать Enum/Constant

```java
public enum ConflictType {
    USER_EXISTS,      // пользователь в БД, но не сотрудник
    EMPLOYEE_EXISTS   // уже полноценный сотрудник
}
```

### 2️⃣ Создать DTO для existingUser

```java
@Data
@Builder
public class ExistingUserInfoDto {
    private Integer userId;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String iin;
}
```

### 3️⃣ Расширить ErrorResponse

```java
@Data
@Builder
public class ErrorResponse {
    private String error;
    private String message;
    private int status;
    private String timestamp;
    private String path;
    
    // ← НОВЫЕ ПОЛЯ (опциональные)
    private Integer userId;
    private ExistingUserInfoDto existingUser;
    private ConflictType conflictType;
    
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Map<String, String> errors;
}
```

### 4️⃣ Обновить Exception Handler

**Было**:
```java
@ExceptionHandler(EmployeeAlreadyExistsException.class)
public ResponseEntity<ErrorResponse> handleEmployeeExists(
        EmployeeAlreadyExistsException ex, 
        HttpServletRequest request) {
    
    return ResponseEntity
        .badRequest()
        .body(ErrorResponse.builder()
            .error("Bad Request")
            .message(ex.getMessage())
            .status(400)
            .timestamp(LocalDateTime.now().toString())
            .path(request.getRequestURI())
            .build());
}
```

**Нужно**:
```java
@ExceptionHandler(EmployeeAlreadyExistsException.class)
public ResponseEntity<ErrorResponse> handleEmployeeExists(
        EmployeeAlreadyExistsException ex, 
        HttpServletRequest request) {
    
    // Получить информацию о существующем пользователе/сотруднике
    User existingUser = ex.getExistingUser();
    ExistingUserInfoDto userInfo = ExistingUserInfoDto.builder()
        .userId(existingUser.getId())
        .firstName(existingUser.getFirstName())
        .lastName(existingUser.getLastName())
        .phoneNumber(existingUser.getPhoneNumber())
        .iin(existingUser.getIin())
        .build();
    
    // Определить тип конфликта
    ConflictType conflictType = ex.getConflictType();
    
    return ResponseEntity
        .badRequest()
        .body(ErrorResponse.builder()
            .error("Bad Request")
            .message(ex.getMessage())
            .status(400)
            .timestamp(LocalDateTime.now().toString())
            .path(request.getRequestURI())
            // ← НОВЫЕ ПОЛЯ
            .userId(existingUser.getId())
            .existingUser(userInfo)
            .conflictType(conflictType)
            .build());
}
```

---

## 🎯 Endpoints для обновления

### 1. POST `/api/v1/employees` — Создание сотрудника

**Сценарий: Номер существует как пользователь (USER_EXISTS)**

```java
@PostMapping
public ResponseEntity<EmployeeDto> createEmployee(@RequestBody CreateEmployeeRequest request) {
    try {
        Employee employee = employeeService.createEmployee(request);
        return ResponseEntity.ok(employeeMapper.toDto(employee));
    } catch (UserWithPhoneAlreadyExistsException ex) {
        // ex должен содержать User и тип конфликта
        throw ex;  // Будет поймана handler'ом
    }
}
```

**Ответ 400**:
```json
{
  "error": "Bad Request",
  "message": "Пользователь с таким номером уже существует",
  "status": 400,
  "timestamp": "2026-01-22T12:00:00Z",
  "path": "/api/v1/employees",
  "userId": 42,
  "existingUser": {
    "userId": 42,
    "firstName": "Иван",
    "lastName": "Иванов",
    "phoneNumber": "+7 (700) 123-45-67",
    "iin": "850101123456"
  },
  "conflictType": "USER_EXISTS"
}
```

---

**Сценарий: Сотрудник уже существует (EMPLOYEE_EXISTS)**

```java
@PostMapping
public ResponseEntity<EmployeeDto> createEmployee(@RequestBody CreateEmployeeRequest request) {
    try {
        Employee employee = employeeService.createEmployee(request);
        return ResponseEntity.ok(employeeMapper.toDto(employee));
    } catch (EmployeeWithPhoneAlreadyExistsException ex) {
        // ex должен содержать Employee и тип конфликта
        throw ex;  // Будет поймана handler'ом
    }
}
```

**Ответ 400**:
```json
{
  "error": "Bad Request",
  "message": "Сотрудник с таким номером уже существует",
  "status": 400,
  "timestamp": "2026-01-22T12:00:00Z",
  "path": "/api/v1/employees",
  "userId": 43,
  "existingUser": {
    "userId": 43,
    "firstName": "Петр",
    "lastName": "Петров",
    "phoneNumber": "+7 (700) 234-56-78",
    "iin": "851202654321"
  },
  "conflictType": "EMPLOYEE_EXISTS"
}
```

---

### 2. POST `/api/v1/employees/confirm-existing/{userId}` — Подтвердить пользователя

**При успехе** (200):
```json
{
  "userId": 42,
  "firstName": "Иван",
  "lastName": "Иванов",
  "phoneNumber": "+7 (700) 123-45-67",
  "email": "ivan@example.com",
  "iin": "850101123456",
  "role": "expert",
  "status": "active",
  "preferredLanguage": null
}
```

**При ошибке** (500):
```json
{
  "error": "Internal Server Error",
  "message": "Не удалось подтвердить пользователя. Причина: ...",
  "status": 500,
  "timestamp": "2026-01-22T12:00:00Z",
  "path": "/api/v1/employees/confirm-existing/42"
}
```

---

### 3. POST `/api/v1/employees/take-phone-create/{userId}` — Отобрать номер и создать

**При успехе** (200):
```json
{
  "userId": 44,  // ← НОВЫЙ пользователь
  "firstName": "Сергей",
  "lastName": "Сергеев",
  "phoneNumber": "+7 (700) 100-00-01",
  "email": "sergey@example.com",
  "iin": "860303123456",
  "role": "expert",
  "status": "active"
}
```

**При ошибке** (500):
```json
{
  "error": "Internal Server Error",
  "message": "Не удалось отобрать номер и создать сотрудника",
  "status": 500,
  "timestamp": "2026-01-22T12:00:00Z",
  "path": "/api/v1/employees/take-phone-create/42"
}
```

---

## 📋 Чеклист реализации

- [ ] Создан Enum `ConflictType` с значениями `USER_EXISTS` и `EMPLOYEE_EXISTS`
- [ ] Создан DTO `ExistingUserInfoDto` с полями: userId, firstName, lastName, phoneNumber, iin
- [ ] Расширен `ErrorResponse` с новыми опциональными полями
- [ ] Обновлены Exception классы:
  - [ ] `UserWithPhoneAlreadyExistsException` — содержит User и conflictType
  - [ ] `EmployeeWithPhoneAlreadyExistsException` — содержит Employee и conflictType
- [ ] Обновлены Exception handlers для возврата новых полей
- [ ] Тестирование: POST `/api/v1/employees` с конфликтом → проверить 400 ответ
- [ ] Тестирование: POST `/api/v1/employees/confirm-existing/{id}` → проверить успех/ошибку
- [ ] Тестирование: POST `/api/v1/employees/take-phone-create/{id}` → проверить успех/ошибка

---

## 🧪 Тестирование

### Тест 1: USER_EXISTS сценарий

```bash
# 1. Создать пользователя с номером
POST /api/v1/users
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "phoneNumber": "+7 (700) 123-45-67",
  "iin": "850101123456"
}
# Результат: User с id=42

# 2. Попытаться создать сотрудника с тем же номером
POST /api/v1/employees
{
  "firstName": "Сергей",
  "lastName": "Сергеев",
  "phoneNumber": "+7 (700) 123-45-67",
  "email": "sergey@example.com",
  "iin": "860303123456",
  "role": "expert",
  "notCitizen": false
}

# Ожидаемый ответ: 400 с conflictType: "USER_EXISTS" и existingUser данными
{
  "error": "Bad Request",
  "message": "Пользователь с таким номером уже существует",
  "status": 400,
  "userId": 42,
  "existingUser": {
    "userId": 42,
    "firstName": "Иван",
    "lastName": "Иванов",
    "phoneNumber": "+7 (700) 123-45-67",
    "iin": "850101123456"
  },
  "conflictType": "USER_EXISTS"
}

# 3. Подтвердить пользователя
POST /api/v1/employees/confirm-existing/42
{
  "firstName": "Сергей",
  "lastName": "Сергеев",
  "phoneNumber": "+7 (700) 123-45-67",
  "email": "sergey@example.com",
  "iin": "860303123456",
  "role": "expert",
  "notCitizen": false
}

# Ожидаемый ответ: 200 с обновленным пользователем (теперь сотрудник)
```

### Тест 2: EMPLOYEE_EXISTS сценарий

```bash
# 1. Создать сотрудника
POST /api/v1/employees
{
  "firstName": "Петр",
  "lastName": "Петров",
  "phoneNumber": "+7 (700) 234-56-78",
  "email": "petr@example.com",
  "iin": "851202654321",
  "role": "expert",
  "notCitizen": false
}
# Результат: Employee с id=43

# 2. Попытаться создать ДРУГОГО сотрудника с тем же номером
POST /api/v1/employees
{
  "firstName": "Сергей",
  "lastName": "Сергеев",
  "phoneNumber": "+7 (700) 234-56-78",
  "email": "sergey@example.com",
  "iin": "860303123456",
  "role": "expert",
  "notCitizen": false
}

# Ожидаемый ответ: 400 с conflictType: "EMPLOYEE_EXISTS" и existingUser данными
{
  "error": "Bad Request",
  "message": "Сотрудник с таким номером уже существует",
  "status": 400,
  "userId": 43,
  "existingUser": {
    "userId": 43,
    "firstName": "Петр",
    "lastName": "Петров",
    "phoneNumber": "+7 (700) 234-56-78",
    "iin": "851202654321"
  },
  "conflictType": "EMPLOYEE_EXISTS"
}
```

### Тест 3: 500 ошибка при confirm

```bash
# Попытаться подтвердить с невалидными данными
POST /api/v1/employees/confirm-existing/999
{...}

# Ожидаемый ответ: 500
{
  "error": "Internal Server Error",
  "message": "Пользователь с id=999 не найден",
  "status": 500,
  "timestamp": "2026-01-22T12:00:00Z",
  "path": "/api/v1/employees/confirm-existing/999"
}
```

---

## ✅ Acceptance Criteria

### ✅ AC1: Все 3 поля возвращаются при конфликте

**When**: POST `/api/v1/employees` возвращает 400  
**Then**: Ответ включает `userId`, `existingUser`, `conflictType`

### ✅ AC2: conflictType правильно различает сценарии

**When**: USER_EXISTS конфликт  
**Then**: `conflictType: "USER_EXISTS"`

**When**: EMPLOYEE_EXISTS конфликт  
**Then**: `conflictType: "EMPLOYEE_EXISTS"`

### ✅ AC3: existingUser содержит все необходимые поля

**Then**: `existingUser` включает userId, firstName, lastName, phoneNumber, iin

### ✅ AC4: 200 ответы остаются без изменений

**When**: Успешное создание/подтверждение  
**Then**: Возвращается Employee DTO как раньше

---

## 🔄 Обратная совместимость

Фронт будет работать и без этих изменений! 

**Текущее поведение** (без расширения):
- Фронт получит 400 без новых полей
- Определит сценарий по substring matching сообщения
- Покажет диалог без данных пользователя
- Снэкбар: "Бэк не вернул данные существующего пользователя"
- Пользователь может всё равно нажать кнопки ("Да, это он" или "отобрать номер")

**Новое поведение** (с расширением):
- Фронт получит 400 с новыми полями
- Определит сценарий по `conflictType` (приоритет 1)
- Покажет диалог С ДАННЫМИ пользователя красиво
- Лучший UX! 🎉

---

## 📞 Questions?

Если возникнут вопросы:
- Смотрите [ZD4_BACKEND_SPEC.md](ZD4_BACKEND_SPEC.md) — подробная спецификация
- Смотрите [ZD4_INTEGRATION.ts](ZD4_INTEGRATION.ts) — примеры всех сценариев
- Смотрите [ALL_ZD_SUMMARY.md](ALL_ZD_SUMMARY.md) — общий обзор

---

**Дата**: 22 января 2026  
**Статус**: ✅ Ready for implementation  
**Приоритет**: Medium (улучшает UX, но фронт уже работает без этого)
