import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { Input } from './ui/Input.jsx';
import { MatriculeInput, EmailInput, TextInput, TextAreaInput } from './fields/index.jsx';

/**
 * Tests des champs — messages d'alerte, compteurs et boutons.
 *
 * Le socle doit se comporter pareil sur tous les écrans : une erreur s'annonce,
 * une saisie reconnue se confirme, un format borné se compte, et un champ se
 * vide sans que l'agent ait à sélectionner tout son contenu.
 */

/** Champ contrôlé, comme dans les formulaires réels. */
function Champ({ composant: Composant, initial = '', ...props }) {
  const [valeur, setValeur] = useState(initial);
  return <Composant value={valeur} onChange={setValeur} {...props} />;
}

const champ = () => screen.getByLabelText(/./, { selector: 'input, textarea' });

describe('Input — messages et aides', () => {
  it('affiche l’erreur sous le champ', () => {
    render(<Input label="Nom" value="" onChange={() => {}} error="Ce champ est obligatoire" />);
    expect(screen.getByText('Ce champ est obligatoire')).toBeTruthy();
  });

  it('affiche le format attendu, puis l’efface devant une erreur', () => {
    const { unmount } = render(
      <Input label="Téléphone" value="" onChange={() => {}} hint="10 chiffres" />
    );
    expect(screen.getByText('10 chiffres')).toBeTruthy();
    unmount();

    render(
      <Input label="Téléphone" value="" onChange={() => {}} hint="10 chiffres" error="Trop court" />
    );
    expect(screen.queryByText('10 chiffres')).toBeNull();
    expect(screen.getByText('Trop court')).toBeTruthy();
  });

  it('affiche la confirmation quand la saisie est reconnue bonne', () => {
    render(
      <Input
        label="Email"
        value="a@b.mg"
        onChange={() => {}}
        success
        successMessage="Adresse email valide."
      />
    );
    expect(screen.getByText('Adresse email valide.')).toBeTruthy();
  });

  it('compte les caractères saisis', () => {
    render(
      <Input label="Objet" value="Bonjour" onChange={() => {}} maxLength={20} showCounter />
    );
    expect(screen.getByText('7/20')).toBeTruthy();
  });

  it('vide le champ avec le bouton d’effacement', () => {
    let valeur = 'Bonjour';
    render(
      <Input
        label="Objet"
        value={valeur}
        onChange={(e) => { valeur = e.target.value; }}
        clearable
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Effacer le champ' }));
    expect(valeur).toBe('');
  });
});

describe('Champs de formulaire — formatage et messages', () => {
  it('groupe un matricule chiffré par trois', () => {
    render(<Champ composant={MatriculeInput} label="N° matricule" />);
    fireEvent.change(champ(), { target: { value: '1234567' } });
    expect(champ().value).toBe('123 456 7');
  });

  it('confirme un matricule valide après avoir quitté le champ', () => {
    render(<Champ composant={MatriculeInput} label="N° matricule" initial="222 222 222" />);
    fireEvent.blur(champ());
    expect(screen.getByText('Matricule valide.')).toBeTruthy();
  });

  it('refuse un matricule trop court', () => {
    render(<Champ composant={MatriculeInput} label="N° matricule" />);
    fireEvent.change(champ(), { target: { value: '7' } });
    fireEvent.blur(champ());
    expect(screen.getByText('Matricule incomplet (1/2)')).toBeTruthy();
  });

  it('met l’email en minuscules', () => {
    render(<Champ composant={EmailInput} label="Email" />);
    fireEvent.change(champ(), { target: { value: 'RAKOTO.Jean@SRSP.MG' } });
    expect(champ().value).toBe('rakoto.jean@srsp.mg');
  });

  it('signale un champ obligatoire resté vide', () => {
    render(<Champ composant={TextInput} label="Objet" required />);
    fireEvent.blur(champ());
    expect(screen.getByText('Ce champ est obligatoire')).toBeTruthy();
  });

  it('compte les caractères d’une zone de texte bornée', () => {
    render(<Champ composant={TextAreaInput} label="Objet" maxLength={50} initial="Demande" />);
    expect(screen.getByText('7/50')).toBeTruthy();
  });
});
