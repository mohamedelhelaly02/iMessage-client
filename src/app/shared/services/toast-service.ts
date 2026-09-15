import { Service, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: number;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

@Service()
export class ToastService {
    private readonly _toasts = signal<ToastMessage[]>([]);
    readonly toasts = this._toasts.asReadonly();
    private nextId = 0;

    show(type: ToastType, title: string, message?: string, duration = 3500): number {
        const id = ++this.nextId;
        const toast: ToastMessage = { id, type, title, message, duration };

        this._toasts.update(list => [...list, toast]);

        if (duration > 0) {
            setTimeout(() => this.dismiss(id), duration);
        }

        return id;
    }

    success(title: string, message?: string, duration?: number): number {
        return this.show('success', title, message, duration);
    }

    error(title: string, message?: string, duration?: number): number {
        return this.show('error', title, message, duration);
    }

    warning(title: string, message?: string, duration?: number): number {
        return this.show('warning', title, message, duration);
    }

    info(title: string, message?: string, duration?: number): number {
        return this.show('info', title, message, duration);
    }

    dismiss(id: number): void {
        this._toasts.update(list => list.filter(t => t.id !== id));
    }

    clear(): void {
        this._toasts.set([]);
    }


}
