/** Labels and messages of the sign-in and sign-up screens. */
export const AUTH_CONTENT = {
  fields: {
    name: {
      label: 'Nom et prénom',
      placeholder: 'Marie Dupont',
      required: 'Saisissez votre nom et votre prénom.',
    },
    email: {
      label: 'Adresse e-mail',
      placeholder: 'vous@exemple.fr',
      hint: 'Format attendu : nom@domaine.fr',
      required: 'Saisissez votre adresse e-mail.',
      invalid:
        'Saisissez une adresse e-mail valide, par exemple vous@exemple.fr.',
    },
    password: {
      label: 'Mot de passe',
      required: 'Saisissez votre mot de passe.',
      tooShort: (min: number) =>
        `Le mot de passe doit contenir au moins ${min} caractères.`,
      hint: (min: number) => `${min} caractères minimum.`,
      show: 'Afficher le mot de passe',
      hide: 'Masquer le mot de passe',
    },
  },
  signIn: {
    title: 'Connexion à CartePro',
    subtitle: 'Accédez à votre espace personnel selon votre profil.',
    submit: 'Se connecter',
    submitting: 'Connexion…',
    noAccount: 'Pas encore de compte ?',
    createAccount: 'Créer un compte',
  },
  signUp: {
    title: 'Créer un compte CartePro',
    subtitle:
      'Votre espace salarié, pour dépenser vos avantages chez les partenaires.',
    submit: 'Créer mon compte',
    submitting: 'Création…',
    hasAccount: 'Vous avez déjà un compte ?',
    signIn: 'Se connecter',
  },
  partnerInvite: {
    prompt: 'Vous représentez un établissement ?',
    link: 'Demander son référencement',
  },
  partnerSignUp: {
    title: 'Référencer votre établissement',
    subtitle:
      'Déposez la demande de votre commerce. Un agent du Ministère l’examine avant toute activation.',
    accountSection: 'Votre compte',
    accountHelp:
      'La personne qui gérera l’établissement dans CartePro. Ce compte servira à encaisser.',
    signedInAs: (email: string) =>
      `Connecté avec ${email}. La demande sera rattachée à ce compte.`,
    dossierSection: 'Votre établissement',
    fields: {
      name: {
        label: 'Nom et prénom du responsable',
      },
      legalName: {
        label: 'Raison sociale',
        hint: 'Telle qu’elle figure au registre du commerce.',
        required: 'Saisissez la raison sociale.',
      },
      tradeName: {
        label: 'Enseigne',
        hint: 'Le nom que les salariés verront dans le catalogue.',
        required: 'Saisissez l’enseigne.',
      },
      siren: {
        label: 'SIREN',
        hint: 'Neuf chiffres. Les espaces sont acceptés.',
        format: 'Le SIREN compte neuf chiffres.',
        checksum: 'Ce SIREN n’est pas valide. Vérifiez chaque chiffre.',
      },
      businessPurpose: {
        label: 'Objet social',
        hint: 'L’activité déclarée au registre. L’agent la compare aux catégories choisies.',
        required: 'Saisissez l’objet social.',
      },
      addressLine: {
        label: 'Adresse',
        hint: 'Numéro et voie. Elle sert à situer l’établissement dans le catalogue.',
        placeholder: '12 rue de la République',
        required: 'Saisissez l’adresse.',
      },
      postalCode: {
        label: 'Code postal',
        format: 'Le code postal compte cinq chiffres.',
      },
      city: {
        label: 'Ville',
        required: 'Saisissez la ville.',
      },
      categories: {
        label: 'Catégories',
        hint: 'Une ou plusieurs, selon ce que vous vendez.',
        required: 'Choisissez au moins une catégorie.',
      },
    },
    submit: 'Déposer la demande',
    submitting: 'Envoi de la demande…',
    hasAccount: 'Votre établissement est déjà référencé ?',
    signIn: 'Se connecter',
  },
  errorSummary: 'Le formulaire contient une erreur.',
} as const;
