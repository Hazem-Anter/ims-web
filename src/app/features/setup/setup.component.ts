import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SetupService } from './setup.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss'
})
export class SetupComponent {
  loading = false;
  error = '';
  form: FormGroup;

  constructor(private fb: FormBuilder, private setup: SetupService, private router: Router) {
    this.form = this.fb.group({
      setupKey: ['', Validators.required], // mandatory
      email: ['', [Validators.required, Validators.email]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const v = this.form.getRawValue();

    this.setup.initialize(
      { email: v.email, userName: v.userName, password: v.password },
      v.setupKey
    ).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/login');
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.message ?? 'Setup failed.';
      }
    });
  }
}
