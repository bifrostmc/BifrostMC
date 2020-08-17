export default function checkUserHasPermission(perm, user) {
	return user.hasPermission(perm);
}
