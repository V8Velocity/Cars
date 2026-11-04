from rest_framework import permissions


class IsVehicleOwner(permissions.BasePermission):
    """
    Object-level permission: only the vehicle's owner can mutate it.
    Safe methods (GET, HEAD, OPTIONS) are always allowed.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class IsOwnerRole(permissions.BasePermission):
    """
    View-level permission: user must have the OWNER role.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and 'OWNER' in getattr(request.user, 'roles', [])
        )


class IsAdminUser(permissions.BasePermission):
    """
    View-level permission: user must have the ADMIN role.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and 'ADMIN' in getattr(request.user, 'roles', [])
        )
