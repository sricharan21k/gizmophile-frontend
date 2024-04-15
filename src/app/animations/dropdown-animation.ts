import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

export const dropdownAnimationFade = trigger('fadeInOut', [
  state('void', style({ opacity: 0, transform: 'translateY(-10px)' })),
  state('*', style({ opacity: 1, transform: 'translateY(0)' })),
  transition('void <=> *', [animate('200ms ease-out')]),
]);
