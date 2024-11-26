const roles = {
    // admin: ['manageDepartments', 'manageAttendance', 'viewAttendance','deletionRequest','deleteUser','getDeletionRequests','manageUsers'],
    // manager: ['manageDepartments', 'manageAttendance', 'viewSelfProfile','deletionRequest'],
    // employee: ['viewSelfAttendance', 'viewSelfLeaves', 'viewSelfProfile', 'updateSelfProfile','deletionRequest'],
    // labour:['viewSelfAttendance', 'viewSelfLeaves', 'viewSelfProfile', 'updateSelfProfile']
    admin: ['manageManagers', 'manageEmployees', 'manageLabours','manageAttendance','viewDashboard','manageSalaries','viewAttendance','manageLeaves'],
    manager: ['manageEmployees', 'manageLabours','viewDashboard','manageAttendance','viewAttendance','manageLeaves'],
    employee: ['manageLabours','viewDashboard','viewAttendance','manageLeaves'],
    labour: []
  };
  
  function permit(allowedRoles) {
    return (req, res, next) => {
      // console.log("User in Permit Middleware:", req.user);
  
      if (!req.user) {
        return res.status(401).json({ error: "User is not authenticated" });
      }
  
      const userRole = req.user.role;
      console.log("User Role:", userRole);
  
      const userPermissions = roles[userRole] || [];
      if (allowedRoles.some((role) => userPermissions.includes(role))) {
        return next();
      }
  
      return res.status(403).json({ error: `Access denied as ${userRole}` });
    };
  }
  
  
  module.exports = permit;