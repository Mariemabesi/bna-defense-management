import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        if (user && user.token) {
            const cloned = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            return next(cloned);
        }
    }
    return next(req);
};
