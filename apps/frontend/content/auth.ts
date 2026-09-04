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
    title: 'Connexion à Ticket Tout',
    subtitle: 'Accédez à votre espace personnel selon votre profil.',
    submit: 'Se connecter',
    submitting: 'Connexion…',
    noAccount: 'Pas encore de compte ?',
    createAccount: 'Créer un compte',
  },
  signUp: {
    title: 'Créer un compte Ticket Tout',
    subtitle:
      'Votre espace salarié, pour dépenser vos avantages chez les partenaires.',
    submit: 'Créer mon compte',
    submitting: 'Création…',
    hasAccount: 'Vous avez déjà un compte ?',
    signIn: 'Se connecter',
  },
  errorSummary: 'Le formulaire contient une erreur.',
} as const;
