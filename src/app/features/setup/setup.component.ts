import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SetupService } from './setup.service';

@Component({
  selector: 'app-setup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly setup = inject(SetupService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      setupKey: ['', Validators.required], // mandatory
      email: ['', [Validators.required, Validators.email]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const v = this.form.getRawValue();

    this.setup.initialize(
      { email: v.email, userName: v.userName, password: v.password },
      v.setupKey
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/login');
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.message ?? 'Setup failed.');
      }
    });
  }
}
