<script lang="ts">
import type { ResolvedPathname } from "$app/types";

type Route = {
  route: ResolvedPathname;
  method: "GET" | "POST" | "PUT" | "DELETE";
  description: string;
  parameters: { name: string; type: string; description: string }[];
};

const apiRoutes: Route[] = [
  {
    route: "/api/persons",
    method: "GET",
    description:
      "Recupere une liste d'utilisateurs pouvant être filtrée par nom, par ville ou par prenom/nom",
    parameters: [
      {
        name: "search",
        type: "string",
        description: "Search by name",
      },
      {
        name: "city",
        type: "string",
        description: "City code",
      },
      {
        name: "sortBy",
        type: '"firstName" | "lastName"',
        description: "Sort by first or last name",
      },
    ],
  },
  {
    route: "/api/persons/[id]",
    method: "DELETE",
    description: "Supprime l'utilisateur actuellement connecté.",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "Identifiant de l'utilisateur a supprimer",
      },
    ],
  },
  {
    route: "/api/persons/[id]",
    method: "PUT",
    description:
      "Met à jour les informations de l'utilisateur actuellement connecté.",
    parameters: [
      {
        name: "firstName",
        type: "string",
        description: "First name",
      },
      {
        name: "lastName",
        type: "string",
        description: "Last name",
      },
      {
        name: "description",
        type: "string",
        description: "Profile description",
      },
      {
        name: "city",
        type: "string",
        description: "City code",
      },
      {
        name: "avatar",
        type: "File",
        description: "Profile picture",
      },
      {
        name: "removeAvatar",
        type: "boolean",
        description: "Set to true to remove profile picture",
      },
    ],
  },
  {
    route: "/api/persons/[id]",
    method: "GET",
    description:
      "Récupère les informations de l'utilisateur identifié par l'id.",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "Identifiant de l'utilisateur a récupérer",
      },
    ],
  },
  {
    route: "/api/associations",
    method: "GET",
    description:
      "Rend une liste d'associations filtree selon les criteres fournit",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Recherche par Nom/mot clef(query param)",
      },
      {
        name: "city",
        type: "string",
        description: "Recherche par nom de ville(query param)",
      },
      {
        name: "sortBy",
        type: '"name" | "type"',
        description: "Tri des resultats par nom ou par type(query param)",
      },
      {
        name: "type",
        type: "string",
        description: "filtre par type d'association(query param)",
      },
    ],
  },
  {
    route: "/api/associations/[id]",
    method: "GET",
    description:
      "Recupere les informations de l'association identifiee par l'id",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "Identifiant de l'association a récupérer",
      },
    ],
  },
  {
    route: "/api/pets",
    method: "GET",
    description:
      "Retourne une liste d'animaux filtrée selon les critères fournis",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Recherche par nom ou description(query param)",
      },
      {
        name: "owner",
        type: "string",
        description: "Filtre par identifiant du propriétaire(query param)",
      },
      {
        name: "species",
        type: "string",
        description: "Filtre par espèce(query param)",
      },
      {
        name: "city",
        type: "string",
        description: "Filtre par ville du propriétaire(query param)",
      },
      {
        name: "sortBy",
        type: '"name" | "species"',
        description: "Tri des resultats par nom ou par espèce(query param)",
      },
    ],
  },
  {
    route: "/api/pets",
    method: "POST",
    description: "Creer un nouvelle animal avec les informations fournies",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Nom de l'animal",
      },
      {
        name: "birth",
        type: "date",
        description: "Date de naissance de l'animal",
      },
      {
        name: "description",
        type: "string",
        description: "Description de l'animal",
      },
      {
        name: "species",
        type: "string",
        description: "Espèce de l'animal",
      },
      {
        name: "breed",
        type: "string",
        description: "Race de l'animal",
      },
      {
        name: "avatar",
        type: "File",
        description: "Image de profil de l'animal",
      },
    ],
  },
  {
    route: "/api/pets/[id]",
    method: "GET",
    description: "Retourne les informations de l'animal identifié par l'id",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "Identifiant de l'animal à récupérer",
      },
    ],
  },
  {
    route: "/api/pets/[id]",
    method: "PUT",
    description:
      "Mettre a jour les informations de l'animal identifié par l'id",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "Identifiant de l'animal à mettre à jour",
      },
      {
        name: "name",
        type: "string",
        description: "Nom de l'animal",
      },
      {
        name: "description",
        type: "string",
        description: "Description de l'animal",
      },
      {
        name: "avatar",
        type: "File",
        description: "Nouvelle image de profil de l'animal",
      },
      {
        name: "removeAvatar",
        type: "boolean",
        description: "Image a supprimer si true",
      },
    ],
  },
  {
    route: "/api/pets/[id]",
    method: "DELETE",
    description: "Supprime l'animal identifié par l'id",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "Identifiant de l'animal à supprimer",
      },
    ],
  },
  {
    route: "/api/posts",
    method: "GET",
    description:
      "Recupere une liste de posts, pouvant être filtrée par auteur ou par mot-clé",
    parameters: [
      {
        name: "author",
        type: "string",
        description: "Filtre les posts par identifiant d'auteur(query param)",
      },
      {
        name: "pet",
        type: "string",
        description: "Filtre les posts par nom d'animal(query param)",
      },
    ],
  },
  {
    route: "/api/posts",
    method: "POST",
    description: "Creer un nouveau post avec les informations fournies",
    parameters: [
      {
        name: "content",
        type: "string",
        description: "Contenu du post",
      },
      {
        name: "pet",
        type: "string",
        description: "Nom de l'animal associé au post",
      },
      {
        name: "file",
        type: "File",
        description: "Fichier joint au post (optionnel)",
      },
    ],
  },
  {
    route: "/api/posts/[id]",
    method: "GET",
    description: "Recuperer un post identifié par l'id",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "Identifiant du post à récupérer",
      },
    ],
  },
  {
    route: "/api/posts/[id]",
    method: "PUT",
    description: "Modifier un POST identifié par l'id",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "Identifiant du post à modifier",
      },
    ],
  },
  {
    route: "/api/posts/[id]",
    method: "DELETE",
    description: "Supprime un post identifié par l'id",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "Identifiant du post à supprimer",
      },
    ],
  },
  {
    route: "/api/posts/[id]/comments",
    method: "GET",
    description: "Recupere les commentaires d'un post identifié par l'idPost",
    parameters: [
      {
        name: "postId",
        type: "string",
        description:
          "Identifiant du post dont on veut récupérer les commentaires",
      },
    ],
  },
  {
    route: "/api/posts/[id]/comments",
    method: "POST",
    description:
      "Ajouter un commentaire a un post existant identifié par l'idPost",
    parameters: [
      {
        name: "postId",
        type: "string",
        description:
          "Identifiant du post auquel on veut ajouter un commentaire",
      },
    ],
  },
  {
    route: "/api/posts/[id]/comments/[id]",
    method: "GET",
    description: "Recupere un commentaire precis",
    parameters: [
      {
        name: "commentId",
        type: "string",
        description: "Identifiant du commentaire à récupérer",
      },
    ],
  },
  {
    route: "/api/posts/[id]/comments/[id]",
    method: "PUT",
    description: "Modifie un commentaire identifié par l'idComment",
    parameters: [
      {
        name: "commentId",
        type: "string",
        description: "Identifiant du commentaire à modifier",
      },
      {
        name: "content",
        type: "string",
        description: "Nouveau contenu du commentaire",
      },
    ],
  },
  {
    route: "/api/posts/[id]/comments/[id]",
    method: "DELETE",
    description: "Supprime un commentaire identifié par l'idComment",
    parameters: [
      {
        name: "commentId",
        type: "string",
        description: "Identifiant du commentaire à supprimer",
      },
    ],
  },
];
</script>

<div class="max-w-6xl mx-auto p-6">
  <!-- Hero section -->
  <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8 mb-10 shadow-lg">
    <h1 class="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-sm">API Documentation</h1>
    <p class="text-lg md:text-xl mb-6">
      Explore all the available routes and understand how to interact with our API.
    </p>

  </div>
  
  <h2 class="text-2xl font-semibold mb-4" >Routes</h2>
  
  <div class="space-y-6">
    {#each apiRoutes as apiRoute}
      <div class="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div class="flex justify-between items-center mb-2">
          <p class="font-medium text-lg">{apiRoute.route}</p>
          <span class="px-3 py-1 rounded text-white text-sm font-semibold 
            {apiRoute.method === "GET" ? 'bg-green-500' :
             apiRoute.method === "POST" ? 'bg-blue-500' :
             apiRoute.method === "PUT" ? 'bg-yellow-500' :
             'bg-red-500'}"> 
            {apiRoute.method}
          </span>" 
        </div>
          
        <p class="text-gray-700 mb-3">{apiRoute.description}</p>
        <p class="font-semibold mb-1">Parameters </p>
        <ul class="space-y-2">
          {#each apiRoute.parameters as param}
            <li class="border rounded  p-2 bg-gray-50">
              <p class="font-medium">{param.name}</p>
              <p class="text-sm text-gray-600">Type:{param.type}</p>
              <p class="text-gray-700">{param.description}</p>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</div>
