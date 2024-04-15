import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

export const cardAnimationFadeIn = trigger('slideUp', [
  state('void', style({ transform: 'translateY(100%)', opacity: 0 })),
  transition(':enter', [
    animate('0.5s ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
  ]),
]);
