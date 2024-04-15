import {
  trigger,
  transition,
  query,
  style,
  animate,
} from '@angular/animations';

export const routeAnimationFade = trigger('routeAnimationTrigger', [
  transition(':enter', [
    style({
      opacity: 0,
    }),
    animate(300),
  ]),
  transition(':leave', [
    animate(
      300,
      style({
        opacity: 0,
      })
    ),
  ]),
]);

export const routeAnimationSlideUp = trigger('routeAnimationTrigger', [
  transition(':enter', [
    style({
      transform: 'translateY(100%)',
      opacity: 0,
    }),
    animate(300),
  ]),
  transition(':leave', [
    animate(
      300,
      style({
        transform: 'translateY(-100%)',
        opacity: 0,
      })
    ),
  ]),
]);
