const roles = {
    // admin: ['manageDepartments', 'manageAttendance', 'viewAttendance','deletionRequest','deleteUser','getDeletionRequests','manageUsers'],
    // manager: ['manageDepartments', 'manageAttendance', 'viewSelfProfile','deletionRequest'],
    // employee: ['viewSelfAttendance', 'viewSelfLeaves', 'viewSelfProfile', 'updateSelfProfile','deletionRequest'],
    // labour:['viewSelfAttendance', 'viewSelfLeaves', 'viewSelfProfile', 'updateSelfProfile']
    admin: ['manageManagers', 'manageEmployees', 'manageLabours','manageAttendance','viewDashboard','manageSalaries'],
    manager: ['manageEmployees', 'manageLabours','viewDashboard','manageAttendance','viewAttendance'],
    employee: ['manageLabours','viewDashboard','viewAttendance'],
    labour: []
  };
  
  function permit(allowedRoles) {
    return (req, res, next) => {
      const userRole = req.user.role; 
      const userPermissions = roles[userRole] || [];
  
      if (allowedRoles.some(role => userPermissions.includes(role))) {
        return next();
      }
      return res.status(403).json({ error: `Access denied as ${userRole}` });
    };
  }
  
  module.exports = permit;