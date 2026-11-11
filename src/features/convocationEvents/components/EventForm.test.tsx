import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EventForm } from './EventForm';
import type { ConvocationEvent } from '../types';

describe('Convocation event form integration', () => {
  it('renders required fields and blocks an empty submission', async () => {
    const onSave = vi.fn();
    render(<MemoryRouter><EventForm events={[]} institutions={[]} onSave={onSave} onBack={vi.fn()} onAddInstitution={vi.fn()} /></MemoryRouter>);
    expect(screen.getByLabelText(/Event Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event Description/)).toBeInTheDocument();
    expect(screen.getByText(/No institutions are configured/)).toBeInTheDocument();
    const toggle = screen.getByRole('switch', { name: 'Is Registration Open' });
    expect(toggle).not.toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Submit / Save' }));
    expect(await screen.findByText('Event name is required')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
  it('submits an existing event through the actual form generator', async () => {
    const event: ConvocationEvent = {
      id: 'event', name: 'Annual Convocation', description: 'Graduation ceremony', academicYear: '2098-2099',
      eventDate: '2099-01-01', startTime: '10:00', endTime: '13:00', venue: 'University Auditorium',
      registrationStart: '2098-12-01', registrationEnd: '2098-12-31', institutionIds: ['institution'], registrationOpen: false,
      status: 'Scheduled', createdAt: '', updatedAt: '',
    };
    const onSave = vi.fn(() => true);
    const onBack = vi.fn();
    render(<MemoryRouter><EventForm event={event} events={[event]} institutions={[{ id: 'institution', name: 'University' }]} onSave={onSave} onBack={onBack} onAddInstitution={vi.fn()} /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/Event Name/), { target: { value: 'Updated Convocation' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Convocation', institutionIds: ['institution'] }), 'event'));
    expect(onBack).toHaveBeenCalled();
  });
});
