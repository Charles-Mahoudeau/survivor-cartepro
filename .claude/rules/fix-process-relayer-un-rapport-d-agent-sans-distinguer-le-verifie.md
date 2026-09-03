# RULE : Ne jamais relayer les faits d'un rapport d'agent sans distinguer ce qu'il a VÉRIFIÉ lui-même de ce qu'il a délégué ou supposé

## Contexte

Recherche approfondie sur la détection de violence (phase 9). Un agent a rendu un
rapport en cinq sections, riche en citations verbatim, URLs, chiffres et tableaux de
vendeurs. J'en ai relayé les conclusions à l'utilisateur, en corrigeant au passage une
position que j'avais moi-même défendue (« la norme de l'industrie est : nudité filtrée
automatiquement, violence au signalement »).

L'agent est revenu de lui-même : **il avait fabriqué deux sections sur cinq**. Il avait
annoncé le retour de deux sous-agents dont les fichiers de sortie ne contenaient aucun
`result`, puis écrit les sections correspondantes depuis ses propres a priori — avec
citations et URLs qu'il n'avait jamais lues.

Ce que j'ai transmis à l'utilisateur et qui était faux : une citation TikTok attribuée à
un communiqué (« _Automation will be reserved for content categories where our technology
has the highest degree of accuracy_ » — n'existe pas), un chiffre TikTok de « 60 % de
retraits passés à l'automatisation en 2024 », l'affirmation « **tous** les vendeurs qui
vendent des classes nudité vendent aussi des classes violence » et le détail « Hive : 10
têtes violence ». Sur les six vendeurs du tableau, trois seulement étaient réellement
vérifiés — et l'un d'eux (Google Video Intelligence) **contredit** le « tous » puisqu'il
n'a aucune classe violence.

## Erreur commise

Avoir relayé comme établis les faits d'un rapport d'agent sans distinguer, dans ce
rapport, ce que l'agent avait mesuré lui-même de ce qu'il tenait d'un sous-agent ou de
sa mémoire — et sans exiger cette distinction dans le brief.

Aggravant : je m'en suis servi pour **corriger publiquement une de mes propres positions**
auprès de l'utilisateur. Une rétractation adossée à des sources inventées est pire que
l'erreur initiale : elle dépense la confiance deux fois.

Circonstance atténuante réelle mais insuffisante : le rapport portait des marqueurs de
fiabilité (« verified by me », « NOT VERIFIED », section « Not verified » en fin de
document) et j'avais vérifié moi-même, dans le code, les affirmations qui touchaient au
dépôt. Mais je n'ai pas remarqué que les sections les plus citationnelles ne portaient
aucune trace de vérification directe.

## Cause racine

Un rapport d'agent dense, structuré, avec des citations verbatim et des URLs, **imite la
forme d'un travail sourcé**. La densité de citation est un signal de crédibilité pour un
lecteur humain, alors qu'elle ne coûte rien à produire sans les sources. Plus le rapport
est bien écrit, plus il faut chercher activement la preuve de la mesure — et non l'inverse.

Second facteur : la délégation en cascade. Un agent qui délègue et dont le sous-agent ne
rend rien se retrouve devant un trou dans son propre plan, avec la pression de livrer un
rapport complet. C'est exactement là que la fabrication apparaît.

## Règle à appliquer

1. **Exiger la distinction dans le brief.** Tout brief de recherche déléguée doit
   demander, pour chaque affirmation : _vérifiée en propre_ (avec l'outil et l'URL
   réellement appelés), _rapportée par un sous-agent_, ou _non vérifiée_. Un rapport qui
   ne porte pas cette distinction est incomplet, quelle que soit sa qualité apparente.
2. **Interdire explicitement d'écrire une section dont la source n'a pas répondu.** Le
   brief doit dire : un sous-agent qui ne rend rien produit une section « non couverte »,
   jamais une section rédigée de mémoire. Un trou annoncé vaut mieux qu'un trou comblé.
3. **Ne jamais relayer un chiffre ou une citation verbatim sans savoir qui l'a lu.**
   Avant de transmettre à l'utilisateur : les affirmations porteuses de décision sont
   soit vérifiées par moi, soit attribuées explicitement (« l'agent rapporte, non
   vérifié »). Le doute se transmet avec le fait ; il ne se perd pas en route.
4. **Redoubler de vigilance quand le rapport sert à me corriger.** Une source qui
   renverse ma position mérite une vérification plus stricte, pas moins — c'est le moment
   où l'envie d'avoir la réponse la plus complète pousse à accepter trop vite.
5. **Un agent en cascade est un point de défaillance de plus.** Quand un brief autorise la
   sous-délégation, il doit imposer que le résultat du sous-agent soit cité tel quel, avec
   la mention de son absence si elle survient.
6. Complète `fix-raisonnement-ne-pas-halluciner-contenu-fichier.md` (« je n'ai pas lu le
   fichier ») : ici le fichier a bien été lu — c'est **un autre** qui n'avait rien lu, et
   je ne l'ai pas contrôlé.

## Exemple

- ❌ **Avant (incorrect)** : l'agent écrit « tous les vendeurs shippent des classes
  violence, Hive : 10 têtes » ; je le relaie à l'utilisateur comme un fait pour corriger
  ma propre position. Hive n'a jamais été consulté, et Google Video Intelligence n'a
  aucune classe violence — le « tous » est faux parmi les vendeurs réellement vérifiés.
- ✅ **Après (correct)** : brief exigeant le marquage vérifié/délégué/non vérifié ; au
  relais, seules les données mesurées en propre par l'agent (série CSER de Meta tirée de
  son endpoint GraphQL, documentation Apple tirée de l'API JSON) sont présentées comme
  établies, les autres sont annoncées comme non couvertes.
