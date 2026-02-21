import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading" role="status" [attr.aria-busy]="true">
      <mat-progress-spinner [diameter]="diameter" mode="indeterminate"></mat-progress-spinner>
      <div class="message" *ngIf="message">{{ message }}</div>
    </div>
  `,
  styleUrl: './loading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingComponent {
  @Input() message = 'Loading...';
  @Input() diameter = 36;
}
