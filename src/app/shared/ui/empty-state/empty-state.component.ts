import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="empty">
      <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
      <h4>{{ title }}</h4>
      <p *ngIf="description">{{ description }}</p>
      <button *ngIf="actionLabel" mat-stroked-button color="primary" (click)="action?.()">
        {{ actionLabel }}
      </button>
    </div>
  `,
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input() icon = 'inventory_2';
  @Input() title = 'Nothing here yet';
  @Input() description = '';
  @Input() actionLabel?: string;
  @Input() action?: () => void;
}
