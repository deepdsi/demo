module.exports = {
    200: {
      Message: "OK",
      IsError: false,
    },
    400: {
      Message: "Bad Request",
      IsError: true,
    },
  
    server: {
      internalError: {
        code: 401,
        message: "Internal server error"
      }
    },
  
    auth: {
      unauthorized: {
        code: 401,
        message: "Unauthorized"
      }
    },
  
    data: {
      invalid: {
        code: 401,
        message: 'Invalid data'
      }
    },
  
    user: {
      userExist: {
        code: 401,
        message: "Email is already exist"
      },
      userNotExist: {
        code: 401,
        message: "User is not exist"
      },
      wrongPassword: {
        code: 401,
        message: "Password is not correct"
      }
    },

    post: {
      postNotExist: {
        code: 401,
        message: "Post is not exist"
      }
    }
  }