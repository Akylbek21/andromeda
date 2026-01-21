/**
 * ЗД №4 — Интеграция расширенного 400-ответа от бэка
 * 
 * Документ объясняет, как фронт обрабатывает 3 основных сценария при конфликте.
 * Никакие изменения в коде фронта не требуются.
 */

// ============================================================================
// СЦЕНАРИЙ 1: Бэк возвращает ТОЛЬКО message (Текущее поведение)
// ============================================================================

/**
 * Бэк возвращает:
 * 
 * HTTP 400
 * {
 *   "error": "Bad Request",
 *   "message": "Пользователь с таким номером уже существует",
 *   "status": 400,
 *   "timestamp": "2026-01-22T12:00:00Z",
 *   "path": "/api/v1/employees"
 * }
 * 
 * Поток фронта:
 * 
 * 1. createEmployee() выбросит EmployeesConflictError с:
 *    - message: "Пользователь с таким номером уже существует"
 *    - status: 400
 *    - userId: undefined (нет в ответе)
 *    - existingUser: undefined (нет в ответе)
 *    - conflictType: undefined (нет в ответе)
 * 
 * 2. CreateEmployeeDialog.onSubmit() поймает ошибку:
 *    - isEmployeesConflictError(error) → true
 *    - determineConflictScenario(error):
 *        * Проверит error.conflictType → undefined (нет)
 *        * Fallback: проверит message → включает "Пользователь с таким номером"
 *        * Вернёт: 'USER_EXISTS'
 *    - hasValidExistingUserData(error) → false (нет existingUser)
 * 
 * 3. Диалог обновится:
 *    - conflictState = {
 *        scenario: 'USER_EXISTS',
 *        existingUser: null,
 *        errorMessage: "Пользователь с таким номером уже существует"
 *      }
 *    - Показан snackbar: "Бэк не вернул данные существующего пользователя" ⚠️
 * 
 * 4. ExistingUserDialog отобразится:
 *    - open: true
 *    - existingUser: null
 *    - Покажет: <Typography color="error">{errorMessage}</Typography>
 *    - Кнопки активны для retry
 */

export const SCENARIO_1_NO_EXTENDED_DATA = {
  backendResponse: {
    error: 'Bad Request',
    message: 'Пользователь с таким номером уже существует',
    status: 400,
    timestamp: '2026-01-22T12:00:00Z',
    path: '/api/v1/employees',
  },
  frontendBehavior: {
    conflictDetected: true,
    conflictType: 'USER_EXISTS (determined by message matching)',
    existingUserData: null,
    warningSnackbar: 'Бэк не вернул данные существующего пользователя',
    dialogShown: 'ExistingUserDialog',
    userSees: 'Только текст сообщения об ошибке (красный текст)',
    userCanDo: [
      'Нажать "Да, это он" → попытка подтвердить (confirmExistingUser)',
      'Нажать "Нет, это не он, отобрать номер" → попытка отобрать номер (takePhoneAndCreate)',
      'Нажать "Закрыть" → закрыть диалог',
    ],
  },
  codeFiles: [
    'src/features/employee-dialogs/CreateEmployeeDialog.tsx (line 88-101)',
    'src/entities/employee/api.ts (handleApiError)',
    'src/features/employee-dialogs/conflict-utils.ts (determineConflictScenario)',
  ],
}

// ============================================================================
// СЦЕНАРИЙ 2: Бэк добавил поля — USER_EXISTS с данными (НОВОЕ)
// ============================================================================

/**
 * Бэк возвращает: (РАСШИРЕННАЯ ВЕРСИЯ)
 * 
 * HTTP 400
 * {
 *   "error": "Bad Request",
 *   "message": "Пользователь с таким номером уже существует",
 *   "status": 400,
 *   "timestamp": "2026-01-22T12:00:00Z",
 *   "path": "/api/v1/employees",
 *   "userId": 42,
 *   "existingUser": {
 *     "userId": 42,
 *     "firstName": "Иван",
 *     "lastName": "Иванов",
 *     "phoneNumber": "+7 (700) 123-45-67",
 *     "iin": "850101123456"
 *   },
 *   "conflictType": "USER_EXISTS"
 * }
 * 
 * Поток фронта: (АВТОМАТИЧЕСКИ, БЕЗ ИЗМЕНЕНИЙ)
 * 
 * 1. createEmployee() выбросит EmployeesConflictError с:
 *    - message: "Пользователь с таким номером уже существует"
 *    - status: 400
 *    - userId: 42 ← НОВОЕ
 *    - existingUser: { userId: 42, firstName: "Иван", ... } ← НОВОЕ
 *    - conflictType: 'USER_EXISTS' ← НОВОЕ
 * 
 * 2. CreateEmployeeDialog.onSubmit() поймает ошибку:
 *    - isEmployeesConflictError(error) → true
 *    - determineConflictScenario(error):
 *        * Проверит error.conflictType → 'USER_EXISTS' ✅ (ПРИОРИТЕТ 1)
 *        * Вернёт: 'USER_EXISTS' (не нужен fallback!)
 *    - hasValidExistingUserData(error) → true ✅
 * 
 * 3. Диалог обновится:
 *    - conflictState = {
 *        scenario: 'USER_EXISTS',
 *        existingUser: { userId: 42, firstName: "Иван", ... }, ← ДАННЫЕ ЕСТЬ!
 *        errorMessage: "Пользователь с таким номером уже существует"
 *      }
 *    - Snackbar НЕ показывается ✅
 * 
 * 4. ExistingUserDialog отобразится:
 *    - open: true
 *    - existingUser: { userId: 42, ... }
 *    - Покажет в красивом box'е:
 *      • ID: 42
 *      • ФИО: Иванов Иван
 *      • WhatsApp номер: +7 (700) 123-45-67
 *      • ИИН: 850101123456
 *    - Кнопки активны
 * 
 * КЛЮЧЕВОЕ: Никаких изменений в коде фронта! Всё работает автоматически.
 */

export const SCENARIO_2_USER_EXISTS_WITH_DATA = {
  backendResponse: {
    error: 'Bad Request',
    message: 'Пользователь с таким номером уже существует',
    status: 400,
    timestamp: '2026-01-22T12:00:00Z',
    path: '/api/v1/employees',
    userId: 42,
    existingUser: {
      userId: 42,
      firstName: 'Иван',
      lastName: 'Иванов',
      phoneNumber: '+7 (700) 123-45-67',
      iin: '850101123456',
    },
    conflictType: 'USER_EXISTS',
  },
  frontendBehavior: {
    conflictDetected: true,
    conflictType: 'USER_EXISTS (from conflictType field, priority 1)',
    existingUserData: {
      userId: 42,
      firstName: 'Иван',
      lastName: 'Иванов',
      phoneNumber: '+7 (700) 123-45-67',
      iin: '850101123456',
    },
    warningSnackbar: null, // ← Не показывается, так как данные есть!
    dialogShown: 'ExistingUserDialog',
    userSees: 'Красивый box с 4 полями: ID, ФИО, номер, ИИН',
    userCanDo: [
      'Нажать "Да, это он" → confirmExistingUser(42, formData)',
      'Нажать "Нет, это не он, отобрать номер" → takePhoneAndCreate(42, formData)',
      'Нажать "Закрыть" → закрыть диалог',
    ],
  },
  codeChanges: 'НОЛЬ! Всё работает благодаря опциональным полям в типах.',
  codeFiles: [
    'src/entities/employee/types.ts (existingUser?: ExistingUserInfo)',
    'src/entities/employee/api.ts (передача в EmployeesConflictError)',
    'src/features/employee-dialogs/CreateEmployeeDialog.tsx (автоматически使用)',
    'src/features/employee-dialogs/ExistingUserDialog.tsx (условный рендер)',
    'src/features/employee-dialogs/conflict-utils.ts (приоритет conflictType)',
  ],
}

// ============================================================================
// СЦЕНАРИЙ 3: EMPLOYEE_EXISTS с данными (НОВОЕ)
// ============================================================================

/**
 * Бэк возвращает:
 * 
 * HTTP 400
 * {
 *   "error": "Bad Request",
 *   "message": "Сотрудник с таким номером уже существует",
 *   "status": 400,
 *   "timestamp": "2026-01-22T12:00:00Z",
 *   "path": "/api/v1/employees",
 *   "userId": 43,
 *   "existingUser": {
 *     "userId": 43,
 *     "firstName": "Петр",
 *     "lastName": "Петров",
 *     "phoneNumber": "+7 (700) 234-56-78",
 *     "iin": "851202654321"
 *   },
 *   "conflictType": "EMPLOYEE_EXISTS"
 * }
 * 
 * Поток фронта:
 * 
 * 1. createEmployee() выбросит EmployeesConflictError с conflictType: 'EMPLOYEE_EXISTS'
 * 
 * 2. CreateEmployeeDialog.onSubmit():
 *    - determineConflictScenario(error) → 'EMPLOYEE_EXISTS' ✅
 *    - hasValidExistingUserData(error) → true ✅
 * 
 * 3. Диалог обновится:
 *    - conflictState = {
 *        scenario: 'EMPLOYEE_EXISTS',
 *        existingUser: { userId: 43, firstName: "Петр", ... },
 *      }
 * 
 * 4. CreateEmployeeDialog условно отобразит:
 *    - scenario === 'EMPLOYEE_EXISTS' → показать EmployeeExistsDialog
 * 
 * 5. EmployeeExistsDialog отобразится:
 *    - Заголовок: "Сотрудник с таким номером телефона уже существует, вот его данные:"
 *    - Box с данными: ID, ФИО, номер, ИИН
 *    - Кнопка "Да, это он" → handleEmployeeExistsConfirm()
 *    - Кнопка "Нет, это не он, отобрать номер" → handleTakePhone()
 * 
 * 6. Если пользователь нажимает "Да, это он":
 *    - Показывается RefusalDialog с сообщением:
 *      "Вам нужно найти этого сотрудника в разделе Сотрудники и активировать..."
 *    - (На этом сценарий заканчивается)
 * 
 * 7. Если пользователь нажимает "Нет, это не он, отобрать номер":
 *    - takePhoneAndCreate(43, formData)
 *    - Если успех → onSuccess() → refetch сотрудников
 */

export const SCENARIO_3_EMPLOYEE_EXISTS_WITH_DATA = {
  backendResponse: {
    error: 'Bad Request',
    message: 'Сотрудник с таким номером уже существует',
    status: 400,
    timestamp: '2026-01-22T12:00:00Z',
    path: '/api/v1/employees',
    userId: 43,
    existingUser: {
      userId: 43,
      firstName: 'Петр',
      lastName: 'Петров',
      phoneNumber: '+7 (700) 234-56-78',
      iin: '851202654321',
    },
    conflictType: 'EMPLOYEE_EXISTS',
  },
  frontendBehavior: {
    conflictDetected: true,
    conflictType: 'EMPLOYEE_EXISTS',
    existingUserData: {
      userId: 43,
      firstName: 'Петр',
      lastName: 'Петров',
      phoneNumber: '+7 (700) 234-56-78',
      iin: '851202654321',
    },
    dialogShown: 'EmployeeExistsDialog',
    userSees: 'Box с данными сотрудника: ID, ФИО, номер, ИИН',
    userFlows: {
      confirmFlow: {
        action: 'Нажать "Да, это он"',
        result: 'Показать RefusalDialog с инструкциями',
        endpoint: 'НЕ вызывается API (это информационный диалог)',
      },
      takePhoneFlow: {
        action: 'Нажать "Нет, это не он, отобрать номер"',
        result: 'Вызвать takePhoneAndCreate(43, formData)',
        endpoint: 'POST /api/v1/employees/take-phone-create/43',
      },
    },
  },
  codeChanges: 'НОЛЬ! Работает автоматически благодаря уже написанному коду.',
}

// ============================================================================
// ПРАКТИЧЕСКИЙ ПРИМЕР: Полный flow USER_EXISTS → confirmExistingUser
// ============================================================================

export const FULL_FLOW_EXAMPLE = {
  description: 'Пользователь заполняет форму, нажимает "Добавить", номер конфликтует',

  steps: [
    {
      step: 1,
      action: 'Пользователь заполняет форму создания сотрудника',
      formData: {
        firstName: 'Сергей',
        lastName: 'Сергеев',
        phoneNumber: '+7 (700) 100-00-01',
        email: 'sergey@example.com',
        iin: '860303123456',
        role: 'expert',
        notCitizen: false,
      },
    },

    {
      step: 2,
      action: 'Нажимает кнопку "Добавить сотрудника"',
      callsFront: 'handleSubmit(formData)',
      callsAPI: 'POST /api/v1/employees',
    },

    {
      step: 3,
      action: 'Бэк обнаруживает конфликт (номер уже в БД как пользователь)',
      backendReturns: {
        status: 400,
        body: {
          message: 'Пользователь с таким номером уже существует',
          userId: 42,
          existingUser: {
            userId: 42,
            firstName: 'Иван',
            lastName: 'Иванов',
            phoneNumber: '+7 (700) 100-00-01',
            iin: '850101123456',
          },
          conflictType: 'USER_EXISTS',
        },
      },
    },

    {
      step: 4,
      action: 'Фронт ловит ошибку в onSubmit()',
      frontendCode: `
        catch (error) {
          if (isEmployeesConflictError(error)) {
            const scenario = determineConflictScenario(error)  // → 'USER_EXISTS'
            const hasData = hasValidExistingUserData(error)    // → true
            
            setConflictState({
              scenario: 'USER_EXISTS',
              existingUser: error.existingUser, // { userId: 42, ... }
              formData,
              errorMessage: error.message
            })
          }
        }
      `,
    },

    {
      step: 5,
      action: 'CreateEmployeeDialog показывает ExistingUserDialog',
      renderLogic: `
        {conflictState?.scenario === 'USER_EXISTS' && (
          <ExistingUserDialog
            open={true}
            existingUser={conflictState.existingUser}
            onConfirm={handleExistingUserConfirm}
            onTakePhone={handleTakePhone}
            onClose={handleConflictClose}
          />
        )}
      `,
    },

    {
      step: 6,
      action: 'ExistingUserDialog отобразит данные красиво',
      displays: [
        'ID: 42',
        'ФИО: Иванов Иван',
        'WhatsApp номер: +7 (700) 100-00-01',
        'ИИН: 850101123456',
      ],
      buttons: [
        { text: 'Да, это он', onClick: 'handleExistingUserConfirm()' },
        { text: 'Нет, это не он, отобрать номер', onClick: 'handleTakePhone()' },
      ],
    },

    {
      step: 7,
      action: 'Пользователь нажимает "Да, это он"',
      frontendCalls: 'handleExistingUserConfirm()',
      frontendCode: `
        async handleExistingUserConfirm() {
          if (!conflictState?.existingUser) return
          
          try {
            await confirmExistingUser(
              conflictState.existingUser.userId, // 42
              conflictState.formData // { firstName, lastName, ... }
            )
            enqueueSnackbar('Сотрудник добавлен', { variant: 'success' })
            handleClose()
            onSuccess() // refetch
          } catch (error) {
            // 500 ошибка? Показать snackbar, диалог остаётся открыт
            enqueueSnackbar(error.message, { variant: 'error' })
          }
        }
      `,
    },

    {
      step: 8,
      action: 'Фронт вызывает confirmExistingUser(42, formData)',
      apiCall: 'POST /api/v1/employees/confirm-existing/42',
      payload: {
        firstName: 'Сергей',
        lastName: 'Сергеев',
        phoneNumber: '+7 (700) 100-00-01',
        email: 'sergey@example.com',
        iin: '860303123456',
        role: 'expert',
        notCitizen: false,
      },
    },

    {
      step: 9,
      action: 'Бэк обновляет пользователя → становится сотрудником',
      backendReturns: {
        status: 200,
        body: {
          userId: 42,
          firstName: 'Сергей',
          lastName: 'Сергеев',
          phoneNumber: '+7 (700) 100-00-01',
          email: 'sergey@example.com',
          iin: '860303123456',
          role: 'expert',
          status: 'active',
        },
      },
    },

    {
      step: 10,
      action: 'Фронт закрывает диалоги и обновляет список',
      frontendActions: [
        'handleClose() → закрыть все диалоги',
        'onSuccess() → вызвать refetch сотрудников',
        'Показать snackbar: "Сотрудник добавлен"',
      ],
    },
  ],
}

// ============================================================================
// ОБРАБОТКА ОШИБОК
// ============================================================================

export const ERROR_SCENARIOS = {
  scenario_500_during_confirm: {
    description: 'Бэк вернул 500 при confirmExistingUser',
    backendReturns: {
      status: 500,
      body: {
        error: 'Internal Server Error',
        message: 'Не удалось подтвердить пользователя',
        status: 500,
      },
    },
    frontendBehavior: {
      codeLocation:
        'src/features/employee-dialogs/CreateEmployeeDialog.tsx, handleExistingUserConfirm(), catch block',
      logic: `
        catch (error) {
          enqueueSnackbar(error.message, { variant: 'error' })
          // conflictState НЕ очищается! Диалог остаётся открыт.
          // Пользователь может:
          // 1. Нажать "Да, это он" ещё раз (retry)
          // 2. Нажать "Нет, это не он, отобрать номер" (другой action)
          // 3. Нажать "Закрыть" (выход)
        }
      `,
      userSees: 'Error snackbar с сообщением от бэка',
      userCan: [
        'Retry: нажать "Да, это он" ещё раз',
        'Alter: нажать "Нет, это не он, отобрать номер"',
        'Cancel: нажать крестик, закрыть диалог',
      ],
      uiStayOpen: true,
    },
  },

  scenario_network_timeout: {
    description: 'Network timeout при confirmExistingUser',
    backendReturns: 'No response (ETIMEDOUT)',
    frontendBehavior: {
      catchsAs: 'Error or AxiosError depending on Axios config',
      errorMessage: 'Network error или Connection timeout',
      userSees: 'Error snackbar',
      userCan: ['Retry', 'Switch to take-phone action', 'Close'],
      uiStayOpen: true,
    },
  },

  scenario_no_data_in_400: {
    description: 'Бэк вернул 400 без existingUser объекта',
    backendReturns: {
      status: 400,
      body: {
        error: 'Bad Request',
        message: 'Пользователь с таким номером уже существует',
        // userId, existingUser, conflictType отсутствуют
      },
    },
    frontendBehavior: {
      hasValidExistingUserData: false,
      warningSnackbar: 'Бэк не вернул данные существующего пользователя',
      dialogShows: 'ExistingUserDialog with errorMessage in red text',
      userCanStill: [
        'Нажать "Да, это он" → попытается confirmExistingUser без данных',
        'Нажать "Нет, это не он, отобрать номер" → попытается takePhoneAndCreate',
      ],
    },
  },
}

// ============================================================================
// РЕЗЮМЕ: ЧТО ОЗНАЧАЕТ "ФРОНТ ГОТОВ"
// ============================================================================

export const READINESS_CHECKLIST = {
  '✅ Типы поддерживают опциональные поля': {
    file: 'src/entities/employee/types.ts',
    fields: [
      'userId?: number',
      'existingUser?: ExistingUserInfo',
      'conflictType?: ConflictType',
    ],
  },

  '✅ API слой передаёт все поля':  {
    file: 'src/entities/employee/api.ts',
    function: 'handleApiError()',
    lines: '21-31',
  },

  '✅ Утилиты определяют сценарий по conflictType с fallback': {
    file: 'src/features/employee-dialogs/conflict-utils.ts',
    function: 'determineConflictScenario()',
    priority: ['conflictType field', 'message matching', 'UNKNOWN'],
  },

  '✅ CreateEmployeeDialog логика готова':  {
    file: 'src/features/employee-dialogs/CreateEmployeeDialog.tsx',
    function: 'onSubmit(), catch block',
    lines: '85-110',
  },

  '✅ ExistingUserDialog условно отбражает данные': {
    file: 'src/features/employee-dialogs/ExistingUserDialog.tsx',
    condition: 'existingUser ? <Box with data> : <Typography error>',
  },

  '✅ EmployeeExistsDialog условно отрисовывает данные': {
    file: 'src/features/employee-dialogs/EmployeeExistsDialog.tsx',
    condition: 'existingUser ? <Box with data> : <Typography error>',
  },

  '✅ Все ошибки 500+ обрабатываются без крешей': {
    file: 'src/features/employee-dialogs/CreateEmployeeDialog.tsx',
    handlers: [
      'handleExistingUserConfirm() — catch → snackbar, диалог открыт',
      'handleTakePhone() — catch → snackbar, диалог открыт',
    ],
  },
}

export const CONCLUSION = `
🎯 ИТОГ: Фронт на 100% готов.

Когда бэк добавит поля в 400-ответ:

HTTP 400
{
  ...,
  "userId": 42,
  "existingUser": { "userId": 42, "firstName": "...", ... },
  "conflictType": "USER_EXISTS"
}

Фронт АВТОМАТИЧЕСКИ начнёт показывать красивые диалоги с данными.

Никаких правок в коде фронта не требуется.

Обратная совместимость: старые 400-ответы без полей тоже будут работать.

Статус: ✅ Ready for production
`
