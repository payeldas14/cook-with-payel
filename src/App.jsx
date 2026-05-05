import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { FaAnglesDown, FaArrowLeft, FaFilter, FaPlus, FaRegClock, FaUtensils } from "react-icons/fa6";
import { useEffect, useMemo, useRef, useState } from "react";
import { IoSearch } from "react-icons/io5";

const STORAGE_KEY = "cook-with-payel-user-recipes";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1447078806655-40579c2520d6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const defaultRecipes = [
  {
    id: "base-1",
    title: "One-Pot Chicken Curry",
    description: "A cozy and quick chicken curry with onions, tomatoes, and gentle spices.",
    category: "chicken",
    ingredients: ["chicken", "onion", "tomato", "garlic", "turmeric", "chili"],
    instructions: "Saute onion and garlic. Add spices and chicken. Add tomato and simmer till tender.",
    cookingTimeMins: 40,
    image:
      "https://images.unsplash.com/photo-1631452180539-96aca7d48617?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-05-04T10:00:00.000Z"
  },
  {
    id: "base-2",
    title: "Lemon Herb Fish Fry",
    description: "Pan-fried fish fillets with lemon, garlic, and herbs in under 20 minutes.",
    category: "fish",
    ingredients: ["fish fillet", "lemon", "garlic", "black pepper", "salt", "olive oil"],
    instructions: "Marinate fish and pan fry both sides until golden and flaky.",
    cookingTimeMins: 22,
    image:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-05-03T12:45:00.000Z"
  },
  {
    id: "base-3",
    title: "Veggie Stir-Fry Bowl",
    description: "Colorful mixed vegetables tossed in a light soy-ginger sauce.",
    category: "vegetarian",
    ingredients: ["broccoli", "carrot", "bell pepper", "soy sauce", "ginger", "sesame"],
    instructions: "Stir fry vegetables on high heat, add sauce, and serve warm.",
    cookingTimeMins: 18,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-05-02T08:30:00.000Z"
  },
  {
    id: "base-4",
    title: "Quick Mango Yogurt Dessert",
    description: "A no-cook creamy dessert with mango, yogurt, and a hint of honey.",
    category: "dessert",
    ingredients: ["mango", "yogurt", "honey", "nuts"],
    instructions: "Blend mango with yogurt, top with honey and chopped nuts.",
    cookingTimeMins: 10,
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-05-01T17:15:00.000Z"
  },
  {
    id: "base-5",
    title: "Masala Omelette Toast",
    description: "A simple breakfast of fluffy masala omelette served over buttered toast.",
    category: "breakfast",
    ingredients: ["egg", "onion", "green chili", "bread", "butter", "salt"],
    instructions: "Whisk eggs with chopped veggies, cook omelette, and serve on toast.",
    cookingTimeMins: 15,
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2026-04-30T07:00:00.000Z"
  }
];

function readUserRecipes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserRecipes(recipes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

function sortLatest(recipes) {
  return [...recipes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function formatDate(input) {
  return new Date(input).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatCookingTime(totalMins) {
  const mins = Number(totalMins) || 0;
  if (mins < 60) return `${mins} mins`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining > 0 ? `${hours} hr ${remaining} mins` : `${hours} hr`;
}

function isUserRecipe(recipe) {
  return typeof recipe?.id === "string" && recipe.id.startsWith("user-");
}

function stripInstructionStepPrefix(line) {
  return line.replace(/^\d+\s*[\.)]\s*/, "").trim();
}

/** Supports one paragraph, one step per line, or numbered lines (1. 2.) including on a single line. */
function parseInstructionSteps(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    return { type: "paragraph", text: "" };
  }

  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lines.length > 1) {
    const steps = lines.map(stripInstructionStepPrefix).filter(Boolean);
    if (steps.length > 0) {
      return { type: "list", steps };
    }
    return { type: "paragraph", text: trimmed };
  }

  const single = lines[0] ?? trimmed;
  const chunks = single.split(/\s+(?=\d+\s*[\.)]\s)/).map((c) => c.trim()).filter(Boolean);
  const steps = chunks.map(stripInstructionStepPrefix).filter(Boolean);

  if (chunks.length > 1 && steps.length > 0) {
    return { type: "list", steps };
  }

  return { type: "paragraph", text: stripInstructionStepPrefix(single) };
}

function TrashHoverIcon() {
  return (
    <svg className="trash-hover-icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false">
      <g className="trash-hover-icon__lid">
        <path d="M8.5 6.7h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M10.2 5.1h3.6a1 1 0 0 1 1 1V7H9.2V6.1a1 1 0 0 1 1-1z" fill="currentColor" />
      </g>
      <rect x="7.2" y="8.2" width="9.6" height="11.1" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10.4 11.1v5.8M12 11.1v5.8M13.6 11.1v5.8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <NavLink to="/" className="logo">
          <FaUtensils /> Cook With Payel
        </NavLink>
        <nav className="site-nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/recipes">Recipes</NavLink>
          <NavLink to="/add-recipe">Add Recipe</NavLink>
        </nav>
      </div>
    </header>
  );
}

function RecipeCard({ recipe, onDeleteRecipe }) {
  const detailPath = `/recipes/${recipe.id}`;
  const showDelete = isUserRecipe(recipe) && typeof onDeleteRecipe === "function";

  function handleDeleteClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!window.confirm(`Delete "${recipe.title}"? This cannot be undone.`)) return;
    onDeleteRecipe(recipe.id);
  }

  return (
    <div className="recipe-card-shell">
      {showDelete ? (
        <button
          type="button"
          className="recipe-delete-icon recipe-delete-icon--floating"
          aria-label={`Delete ${recipe.title}`}
          onClick={handleDeleteClick}
        >
          <TrashHoverIcon />
        </button>
      ) : null}
      <Link
        to={detailPath}
        className="recipe-card-link"
        aria-label={`Open recipe ${recipe.title}, ${recipe.category}, ${formatCookingTime(recipe.cookingTimeMins)}`}
      >
        <article className="recipe-card">
          <div className="recipe-card-media">
            <img className="recipe-image" src={recipe.image || FALLBACK_IMAGE} alt="" loading="lazy" />
            <span className="badge badge--overlay">{recipe.category}</span>
            <span className="badge badge--overlay badge--overlay-time">
              <FaRegClock aria-hidden="true" />
              {formatCookingTime(recipe.cookingTimeMins)}
            </span>
          </div>
          <div className="recipe-content">
            <h3 className="recipe-card-title">{recipe.title}</h3>
            <p>{recipe.description}</p>
            <p className="ingredient-line">
              <strong>Ingredients:</strong> {recipe.ingredients.join(", ")}
            </p>
          </div>
        </article>
      </Link>
    </div>
  );
}

function Home({ allRecipes, onDeleteRecipe }) {
  const latestFour = useMemo(() => allRecipes.slice(0, 4), [allRecipes]);

  return (
    <>
      <section
        className="hero"
        style={{ "--hero-image": `url("${HERO_IMAGE}")` }}
        aria-label="Hero: rustic cake and baking scene"
      >
        <div className="container hero-inner hero-grid">
          <div className="hero-content">
            <h1>Your cozy recipe corner for everyday cooking</h1>
            <p className="hero-text">
              Cook With Payel shares easy home-style dishes with clear steps, simple ingredients, and flavors
              everyone can enjoy. Discover meals, desserts, and breakfast ideas for any day.
            </p>
            <div className="hero-actions">
              <NavLink className="btn btn-primary" to="/recipes">
                <FaUtensils /> Explore Recipes
              </NavLink>
              <NavLink className="btn btn-secondary" to="/add-recipe">
                <FaPlus /> Share Your Recipe
              </NavLink>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="page-head-centered">
            <h2>Latest Recipes</h2>
          </div>
          <div className="home-recipes-wrap">
            <div className="recipe-grid home-recipe-grid">
              {latestFour.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} onDeleteRecipe={onDeleteRecipe} />
              ))}
            </div>
            <div className="home-more-wrap">
              <NavLink className="text-link-orange home-more-block home-more-nudge" to="/recipes">
                <span className="home-more-label">More Recipes</span>
                <span className="home-more-arrow" aria-hidden="true">
                  <FaAnglesDown />
                </span>
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Recipes({ allRecipes, onDeleteRecipe }) {
  const [filter, setFilter] = useState("latest");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const toolbarRef = useRef(null);
  const searchInputRef = useRef(null);
  const filterSelectRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!toolbarRef.current?.contains(event.target)) {
        setSearchOpen(false);
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (filterOpen) {
      filterSelectRef.current?.focus();
    }
  }, [filterOpen]);

  const filteredRecipes = useMemo(() => {
    let result = [...allRecipes];

    if (filter !== "latest") {
      result = result.filter((recipe) => recipe.category === filter);
    }

    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      result = result.filter((recipe) => {
        const haystack = [
          recipe.title,
          recipe.description,
          recipe.category === "dessert" ? "dessert sweet" : recipe.category,
          recipe.ingredients.join(" "),
          recipe.instructions
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      });
    }

    return result;
  }, [allRecipes, filter, query]);

  return (
    <main className="section">
      <div className="container">
        <div className="page-head-centered">
          <h1>All Recipes</h1>
          <p className="muted">Browse all recipes by category, or search with a keyword.</p>
        </div>
        <div ref={toolbarRef} className="toolbar recipes-toolbar">
          <div className={`filter-expand${filterOpen ? " filter-expand--open" : ""}`}>
            <select
              ref={filterSelectRef}
              id="recipes-filter-select"
              className="filter-expand-select"
              value={filter}
              aria-label="Show all recipes or filter by category"
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="latest">All</option>
              <option value="chicken">Chicken</option>
              <option value="fish">Fish</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="dessert">Dessert</option>
              <option value="breakfast">Breakfast</option>
            </select>
            <button
              type="button"
              className="toolbar-icon-btn"
              aria-expanded={filterOpen}
              aria-controls="recipes-filter-select"
              aria-label={filterOpen ? "Close filter" : "Open filter"}
              onClick={() => {
                setFilterOpen((open) => !open);
                setSearchOpen(false);
              }}
            >
              <FaFilter />
            </button>
          </div>
          <div className={`search-expand${searchOpen ? " search-expand--open" : ""}`}>
            <input
              ref={searchInputRef}
              className="search-expand-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="text"
              placeholder="Search recipes..."
              aria-label="Search recipes"
            />
            <button
              type="button"
              className="toolbar-icon-btn"
              aria-expanded={searchOpen}
              aria-label={searchOpen ? "Close search" : "Open search"}
              onClick={() => {
                setSearchOpen((open) => !open);
                setFilterOpen(false);
              }}
            >
              <IoSearch />
            </button>
          </div>
        </div>
        {filteredRecipes.length > 0 ? (
          <div className="recipe-grid">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onDeleteRecipe={onDeleteRecipe} />
            ))}
          </div>
        ) : (
          <p className="empty">No matching recipes found.</p>
        )}
      </div>
    </main>
  );
}

function AddRecipe({ onAddRecipe }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "chicken",
    cookingTimeMins: 20,
    image: "",
    ingredients: "",
    instructions: ""
  });
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const recipe = {
      id: `user-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      cookingTimeMins: Number(form.cookingTimeMins),
      image: form.image.trim() || FALLBACK_IMAGE,
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      instructions: form.instructions.trim(),
      createdAt: new Date().toISOString()
    };

    onAddRecipe(recipe);
    setMessage("Recipe posted successfully.");
    setForm({
      title: "",
      description: "",
      category: "chicken",
      cookingTimeMins: 20,
      image: "",
      ingredients: "",
      instructions: ""
    });
  }

  return (
    <main className="section">
      <div className="container narrow">
        <div className="page-head-centered">
          <h1>Add a New Recipe</h1>
          <p className="muted">Post your dish and it will appear in the recipe section page instantly.</p>
        </div>
        <form className="recipe-form" onSubmit={handleSubmit}>
          <label className="control">
            <span>Recipe Title</span>
            <input required name="title" value={form.title} onChange={handleChange} type="text" />
          </label>
          <label className="control">
            <span>Short Description</span>
            <textarea required name="description" value={form.description} onChange={handleChange} rows={3} />
          </label>
          <label className="control">
            <span>Category</span>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="chicken">Chicken</option>
              <option value="fish">Fish</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="dessert">Dessert</option>
              <option value="breakfast">Breakfast</option>
            </select>
          </label>
          <label className="control">
            <span>Cooking Time (mins)</span>
            <input
              required
              min="1"
              name="cookingTimeMins"
              value={form.cookingTimeMins}
              onChange={handleChange}
              type="number"
            />
          </label>
          <label className="control">
            <span>Image URL</span>
            <input required name="image" value={form.image} onChange={handleChange} type="url" />
          </label>
          <label className="control">
            <span>Ingredients (comma separated)</span>
            <input required name="ingredients" value={form.ingredients} onChange={handleChange} type="text" />
          </label>
          <label className="control">
            <span>Instructions</span>
            <span className="field-hint">
              Put each step on its own line, or number them (1. 2. 3.). You can use several lines or a single line with numbers—either way they will show as clear steps on the recipe page.
            </span>
            <textarea required name="instructions" value={form.instructions} onChange={handleChange} rows={8} />
          </label>
          <button className="btn btn-primary" type="submit">
            <FaPlus /> Post Recipe
          </button>
          {message ? (
            <p className="form-feedback">
              {message}{" "}
              <Link to="/recipes" className="text-link-orange">
                View all recipes
              </Link>
            </p>
          ) : null}
        </form>
      </div>
    </main>
  );
}

function RecipeDetails({ allRecipes, onDeleteRecipe }) {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const recipe = allRecipes.find((item) => item.id === recipeId);

  const instructionParts = useMemo(
    () => (recipe ? parseInstructionSteps(recipe.instructions) : { type: "paragraph", text: "" }),
    [recipe]
  );

  const canDelete = Boolean(recipe && isUserRecipe(recipe) && onDeleteRecipe);

  function handleDeleteDetail() {
    if (!recipe || !onDeleteRecipe) return;
    if (!window.confirm(`Delete "${recipe.title}"? This cannot be undone.`)) return;
    onDeleteRecipe(recipe.id);
    navigate("/recipes", { replace: true });
  }

  if (!recipe) {
    return (
      <main className="section">
        <div className="container narrow page-head-centered">
          <p className="empty">Recipe not found.</p>
          <Link to="/recipes" className="text-link-orange back-link-text">
            <FaArrowLeft /> Back to Recipes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container recipe-detail-page">
        <div className="recipe-detail-actions">
          <Link to="/recipes" className="text-link-orange back-link-text back-btn">
            <FaArrowLeft /> Back to Recipes
          </Link>
        </div>
        <article className="recipe-detail-card">
          <div className="recipe-detail-media">
            <img className="recipe-detail-image" src={recipe.image || FALLBACK_IMAGE} alt={recipe.title} />
          </div>
          <div className="recipe-detail-content">
            <div className="recipe-meta recipe-meta--detail">
              <span className="badge badge--inline">{recipe.category}</span>
              <div className="recipe-meta-trailing">
                <span className="date">
                  <FaRegClock /> {formatCookingTime(recipe.cookingTimeMins)}
                </span>
                {canDelete ? (
                  <button
                    type="button"
                    className="recipe-delete-icon recipe-delete-icon--detail"
                    onClick={handleDeleteDetail}
                    aria-label={`Delete ${recipe.title}`}
                  >
                    <TrashHoverIcon />
                  </button>
                ) : null}
              </div>
            </div>
            <h1>{recipe.title}</h1>
            <p className="recipe-lead">{recipe.description}</p>
            <p className="date posted-on">Posted: {formatDate(recipe.createdAt)}</p>

            <h2>Ingredients</h2>
            <ul className="ingredient-check-list">
              {recipe.ingredients.map((item, index) => (
                <li key={`${recipe.id}-ing-${index}`}>
                  <label className="ingredient-check-label">
                    <input type="checkbox" className="ingredient-check" />
                    <span className="ingredient-text">{item}</span>
                  </label>
                </li>
              ))}
            </ul>

            <h2>Instructions</h2>
            {instructionParts.type === "list" && instructionParts.steps.length > 0 ? (
              <ol className="instruction-steps">
                {instructionParts.steps.map((step, index) => (
                  <li key={`${recipe.id}-step-${index}`}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="detail-instructions">{instructionParts.text}</p>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}

export default function App() {
  const [userRecipes, setUserRecipes] = useState(() => readUserRecipes());
  const allRecipes = useMemo(() => sortLatest([...userRecipes, ...defaultRecipes]), [userRecipes]);

  function handleAddRecipe(recipe) {
    setUserRecipes((prev) => {
      const updated = [recipe, ...prev];
      saveUserRecipes(updated);
      return updated;
    });
  }

  function handleDeleteRecipe(id) {
    if (typeof id !== "string" || !id.startsWith("user-")) return;
    setUserRecipes((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveUserRecipes(next);
      return next;
    });
  }

  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home allRecipes={allRecipes} onDeleteRecipe={handleDeleteRecipe} />} />
        <Route path="/recipes" element={<Recipes allRecipes={allRecipes} onDeleteRecipe={handleDeleteRecipe} />} />
        <Route
          path="/recipes/:recipeId"
          element={<RecipeDetails allRecipes={allRecipes} onDeleteRecipe={handleDeleteRecipe} />}
        />
        <Route path="/add-recipe" element={<AddRecipe onAddRecipe={handleAddRecipe} />} />
      </Routes>
    </div>
  );
}
