import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = localStorage.getItem('authToken');
  // console.log('intercepted', authToken);
  const permittedEndpoints = [
    '/login',
    '/products',
    '/users/',
    '/reviews/',
    '/send-verification-link',
    '/verify-link',
  ];

  if (!permittedEndpoints.some((path) => req.url.includes(path))) {
    console.log('in mod');
    const mod = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`),
    });
    return next(mod);
  }
  return next(req);
};
