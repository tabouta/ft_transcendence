import { error } from "@sveltejs/kit";
import { getPost } from "$lib/posts.remote";
import { getUser } from "$lib/user.remote";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
  data: { currentUser },
  params: { id },
}) => {
  const post = await getPost(id);
  if (!post) error(404);
  const author = await getUser(post.author);
  if (!author) error(404);
  return {
    currentUser,
    post,
    author,
  };
};
