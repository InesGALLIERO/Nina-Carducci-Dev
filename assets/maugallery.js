(function($) {

  // ===== FONCTION PRINCIPALE =====
  $.fn.mauGallery = function(options) {

    // Fusionne les options par défaut avec celles données par l'utilisateur
    var options = $.extend($.fn.mauGallery.defaults, options);

    // Tableau vide → va contenir les catégories des images
    var tagsCollection = [];

    // "this" représente chaque galerie sur laquelle le plugin est appliqué
    return this.each(function() {

      // Crée une ligne Bootstrap pour contenir les images
      $.fn.mauGallery.methods.createRowWrapper($(this));

      // Si la lightbox est activée → on crée la modale
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }

      // Active tous les événements (clic images, filtres, flèches)
      $.fn.mauGallery.listeners(options);

      // Pour chaque image de la galerie
      $(this)
        .children(".gallery-item")
        .each(function(index) {

          // Rend l’image responsive
          $.fn.mauGallery.methods.responsiveImageItem($(this));

          // Déplace l’image dans la ligne Bootstrap
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));

          // Met l’image dans une colonne Bootstrap
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);

          // Récupère la catégorie de l’image
          var theTag = $(this).data("gallery-tag");

          // Ajoute la catégorie au tableau si elle n'existe pas déjà
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      // Crée les boutons filtres
      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      // Petite animation d’apparition
      $(this).fadeIn(500);
    });
  };

  // ===== OPTIONS PAR DÉFAUT =====
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  // ===== GESTION DES ÉVÉNEMENTS =====
  $.fn.mauGallery.listeners = function(options) {

    // Clic sur image → ouvre la modale
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // Clic sur filtres
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);

    // Clic flèche gauche
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );

    // Clic flèche droite
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };

  // ===== MÉTHODES =====
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },


// ===============================
// MODIFICATION : DÉBUT => LOGIQUE DES FLÈCHES DE NAVIGATION
// ===============================

// ===============================
// navigation image PRÉCÉDENTE
// ===============================

// Fonction pour aller à l'image précédente dans la modale
prevImage(lightboxId) {
  // On cible la galerie liée à la modale
  let gallery = $(`#${lightboxId}`).closest(".gallery");
  
  // Récupère l’image affichée
  let activeSrc = $(`#${lightboxId} .lightboxImage`).attr("src");

  // Crée un tableau de toutes les images visibles dans cette galerie
  let imagesCollection = [];
  gallery.find(".gallery-item:visible").each(function() {
    if ($(this).prop("tagName") === "IMG") {
      imagesCollection.push($(this));
    }
  });

  // Position de l’image actuelle
  let index = imagesCollection.findIndex(img => $(img).attr("src") === activeSrc);

  // Correction : si on est au début, on va à la dernière image
  let prevIndex = (index > 0) ? index - 1 : imagesCollection.length - 1;

  // Met à jour l’image dans la modale
  $(`#${lightboxId} .lightboxImage`).attr("src", $(imagesCollection[prevIndex]).attr("src"));
},



// ===============================
//MODIFICATION : navigation image SUIVANTE
// ===============================

// Fonction pour aller à l'image suivante dans la modale
nextImage(lightboxId) {
  // On récupère la galerie actuelle en fonction de la modale
  let gallery = $(`#${lightboxId}`).closest(".gallery");
  
  // Trouve l'image actuellement affichée dans la modale
  let activeSrc = $(`#${lightboxId} .lightboxImage`).attr("src");

  // Crée un tableau de toutes les images visibles dans cette galerie
  let imagesCollection = [];
  gallery.find(".gallery-item:visible").each(function() {
    if ($(this).prop("tagName") === "IMG") {
      imagesCollection.push($(this));
    }
  });

  // Trouve l'index de l'image active
  let index = imagesCollection.findIndex(img => $(img).attr("src") === activeSrc);

  // Correction : si on est à la fin, on revient à la première
  let nextIndex = (index < imagesCollection.length - 1) ? index + 1 : 0;

  // Change l'image dans la modale
  $(`#${lightboxId} .lightboxImage`).attr("src", $(imagesCollection[nextIndex]).attr("src"));
},

// ===============================
// FIN : LOGIQUE DES FLÈCHES DE NAVIGATION
// ===============================


createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
},
showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
},




// ===============================
//MODIFICATION : couleur du filtre actif
// ===============================
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }

      // modification Retire la classe Bootstrap active de tous les filtres
      $(".tags-bar .nav-link").removeClass("active active-tag");

    // modification Ajoute active au filtre sélectionné (fond doré Bootstrap)
    $(this).addClass("active active-tag");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };
})(jQuery);