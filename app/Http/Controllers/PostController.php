<?php

namespace App\Http\Controllers;

use App\Http\Requests\Post\PostRequest;
use App\Http\Resources\Post\PostResource;
use App\Http\Resources\UploadFile\UploadFileResource;
use App\Models\CategoryPost;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\UploadFile;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Posts/PostIndexPage', [
            'posts' => Post::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::select('id', 'name')->get(); // good
        $images = UploadFileResource::collection(
            UploadFile::where('type', 'image')->latest()->get()
        );
        $categories = PostCategory::all();
        return Inertia::render('Posts/PostFormPage', [
            'post' => null,
            'users' => $users,
            'images' => $images,
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PostRequest $request)
    {
        $validated = $request->validated();

        $originalPath = $validated['path'];
        $path = $originalPath;
        $counter = 1;

        while (Post::where('path', $path)->exists()) {
            $path = $originalPath . '-' . $counter++;
        }

        // validated data includes author_id
        $post = Post::create([
            'title' => $validated['title'],
            'path' => $path,
            'content' => $validated['content'],
            'author_id' => $validated['author_id'],
            'image_id' => $validated['image_id'] ?? null,
        ]);

        $categories = CategoryPost::create([
            'post_id' => $post->id,
            'post_category_id' => $validated['category_id']
        ]);

        // Save the SEO meta associated with this post
        $post->seoMeta()->create([
            'meta_title' => $validated['meta_title'],
            'meta_description' => $validated['meta_description'],
            'meta_image' => $validated['meta_image'] ?? $validated['image_id'],
        ]);

        return redirect()->route('posts.index')->with('success', 'Post created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $post = Post::with('seoMeta', 'image', 'categories')->findOrFail($id);
        $postResource = new PostResource($post);
        $images = UploadFileResource::collection(
            UploadFile::where('type', 'image')->latest()->get()
        );
        $categories = PostCategory::all();
        $users = User::select('id', 'name')->get();
        return Inertia::render('Posts/PostFormPage', ['post' => $postResource, 'users' => $users, 'images' => $images, 'categories' => $categories]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
        $users = User::select('id', 'name')->get();
        return Inertia::render('Posts/PostFormPage', ['post' => $post, 'users' => $users]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PostRequest $request, Post $post)
    {
        $validated = $request->validated();

        $post->update([
            'title' => $validated['title'],
            'path' => $validated['path'],
            'content' => $validated['content'],
            'author_id' => $validated['author_id'],
            'image_id' => $validated['image_id'] ?? null,
        ]);

        if ($post->seoMeta) {
            $post->seoMeta()->update([
                'meta_title' => $validated['meta_title'],
                'meta_description' => $validated['meta_description'],
                'meta_image' => $validated['meta_image'] ?? null,
            ]);
        } else {
            $post->seoMeta()->create([
                'meta_title' => $validated['meta_title'],
                'meta_description' => $validated['meta_description'],
                'meta_image' => $validated['meta_image'] ?? null,
            ]);
        }

        return redirect()->route('posts.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        $post->delete();
        return redirect()->route('posts.index');
    }
}
