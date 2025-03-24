<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SSLSIRLICS</title>
    <link rel="icon" href="{{ asset ("rsc/icons/favicon.ico")}}" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="{{ asset ("rsc/css/index.css")}}" />
    <link rel="stylesheet" href="{{ asset ("rsc/css/details.css")}}" />
  </head>
  <body>
    <div class="loading-overlay">
      <div class="loader">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <nav
      class="navbar navbar-light"
      id="navbar"
      style="z-index: 1050; width: 40%; border-radius: 30px">
      <div class="container-fluid">
        <form
          class="d-flex"
          id="search"
          role="search"
          style="
            visibility: visible;
            opacity: 1;
            display: flex !important;
            position: relative;
            width: 100%;
          "></form>
            @if (Route::has('login'))
            <div class="d-flex gap-2">
                @auth
                    <a href="{{ url('/dashboard') }}" class="btn btn-primary btn-sm shadow-sm hover-grow">
                        <i class="fas fa-tachometer-alt me-1"></i>Dashboard
                    </a>
                @else
                    <a href="{{ route('login') }}" class="btn btn-info btn-sm text-white shadow-sm hover-grow">
                        <i class="fas fa-sign-in-alt me-1"></i>Log in
                    </a>

                    @if (Route::has('register'))
                        <a href="{{ route('register') }}" class="btn btn-success btn-sm shadow-sm hover-grow">
                            <i class="fas fa-user-plus me-1"></i>Register
                        </a>
                    @endif
                @endauth
            </div>
            @endif
      </div>
    </nav>
    <div id="map"></div>
    <script src="{{ asset ('rsc/js/config.js')}}"></script>
    <script src="{{ asset ('rsc/js/streetlight_queries.js')}}"></script>
    <script src="{{ asset ('rsc/js/streetlights.js')}}"></script>
    <script src="{{ asset ('rsc/bootstrap/apexcharts/apexcharts.js')}}"></script>
    <script src="{{ asset ('rsc/bootstrap/bootstrap/js/bootstrap.bundle.min.js')}}"></script>
    <script src="{{ asset ('rsc/js/localforage.min.js')}}"></script>

    <script>
      let streetlightMap;
      document.addEventListener("DOMContentLoaded", async () => {
        if (!streetlightMap) {
          streetlightMap = new StreetlightMap();
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (streetlightMap.map) {
            streetlightMap.map.invalidateSize();
          }
        }
      });
    </script>
  </body>
</html>
