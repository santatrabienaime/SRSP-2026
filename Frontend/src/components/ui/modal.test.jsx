import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal.jsx';

/**
 * Tests de la modale.
 *
 * Les écrans présentent leurs modales à l'intérieur d'une carte
 * (`AnimatedCard`), dont le `backdrop-filter` fait d'elle le bloc conteneur des
 * descendants `position: fixed`. La modale doit donc être montée dans <body> :
 * sinon elle s'aligne sur la carte, n'obscurcit qu'elle, et le formulaire
 * apparaît coupé — impossible à remplir jusqu'au bout.
 */
describe('Modal — montage hors du flot de la page', () => {
  it('s’installe dans <body>, pas dans la carte qui la contient', () => {
    const { container } = render(
      <div className="glass-card-modern" style={{ backdropFilter: 'blur(20px)' }}>
        <Modal open title="Nouvelle division">
          <p>Formulaire</p>
        </Modal>
      </div>
    );

    expect(screen.getByRole('dialog').parentElement).toBe(document.body);
    // La carte ne contient plus la modale : plus rien à rogner.
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(screen.getByText('Nouvelle division')).toBeTruthy();
  });

  it('ne rend rien tant qu’elle est fermée', () => {
    render(<Modal open={false} title="Nouvelle division" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('se ferme avec Échap et rend le défilement à la page', () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <Modal open title="Nouvelle division" onClose={onClose}>
        <p>Formulaire</p>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
