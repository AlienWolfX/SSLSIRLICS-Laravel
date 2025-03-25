<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SSLSIRLICS</title>
    <link rel="icon" href="{{ asset ('rsc/icons/favicon.ico')}}" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="{{ asset ('rsc/leaflet/leaflet.css')}}" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
    <script src="{{ asset ('rsc/leaflet/leaflet.js')}}"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="{{ asset ('rsc/css/index.css')}}" />
    <link rel="stylesheet" href="{{ asset ('rsc/css/details.css')}}" />
    <link rel="stylesheet" href="{{ asset ('rsc/css/login_register.css')}}" />
  </head>
  <body>
    {{-- <div class="loading-overlay">
      <div class="loader">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div> --}}
    <nav
      class="navbar navbar-light fixed-top "
      id="navbar"
      style="z-index: 1050; width: 98%; border-radius: 30px">
      <div class="container-fluid">
            @if (Route::has('login'))
            <div class="d-flex gap-2 position-absolute top-0 end-0 mt-2  d-flex">
                @auth
                    <a href="{{ url('/dashboard') }}" class="btn btn-primary btn-sm shadow-sm hover-grow">
                        <i class="fas fa-tachometer-alt me-1"></i>Dashboard
                    </a>
                @else

                    <button class="btn btn-info btn-sm text-white shadow-sm hover-grow" data-bs-toggle="modal" data-bs-target="#login">
                      <i class="fas fa-sign-in-alt me-1"></i> Login
                    </button>

                    @if (Route::has('register'))

                        <button class="btn btn-success btn-sm shadow-sm hover-grow" data-bs-toggle="modal" data-bs-target="#register">
                          <i class="fas fa-user-plus me-1"></i> Register
                        </button>
                    @endif
                @endauth
            </div>
            @endif
      </div>
    </nav>

      
    <!-- Authentication Modal -->
    <!-- To show easy to modify ---   <div class="modal show" id="login" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="false" style="display: block;"> -->
      <div class="modal" id="login" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true">
      <!-- To hide and clickable ---   <div class="modal" id="login" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true"> -->
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content ">
          <span class="icon-close">
              <i class="fa-solid fa-xmark" data-bs-dismiss="modal" aria-label="Close"></i>
                <!-- To show easy to modify ---   <button type="button" class="btn-close" aria-label="Close"></button> -->
              <!-- <button type="button" class="btn-close" aria-label="Close"></button> -->
              <!-- To hide and clickable ---   <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
            </span>
            <form class="login-form">
              <h2 class="modal-title mt-3 mb-1">Login</h2>
              <div class="input-box">
                <i class="fa-solid fa-envelope"></i>
                <input type="email" id="name" required>
                <label>Email</label>
              </div>
              <div class="input-box">
                <i class="fa-solid fa-lock"></i>
                <input type="password"  id="password" required>
                <label>Password</label>
              </div>
              <div class="remember-forgot">
                  <label> <input type="checkbox" id="remember">Remember me</label>
                  <a href="#" >Forgot Password?</a>        
              </div>
              <button type="login" class="btn-login">Login</button>
              <div class="login-register">
                <p>Don't have an account? <a href="#" class="register-link">Register</a></p>
              </div>
              
            </form>
        </div>
      </div>
    </div>


    <!-- To show easy to modify ---   <div class="modal show" id="register" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="false" style="display: block;"> -->
      <div class="modal" id="register" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true">
      <!-- To hide and clickable ---   <div class="modal" id="register" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true"> -->
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content-registration  ">
          <span class="icon-close">
            <i class="fa-solid fa-xmark" data-bs-dismiss="modal" aria-label="Close" ></i>
              <!-- To show easy to modify ---   <button type="button" class="btn-close" aria-label="Close"></button> -->
            <!-- <button type="button" class="btn-close" aria-label="Close"></button> -->
            <!-- To hide and clickable ---   <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
          </span>
          <form class="registration-form">
            <h2 class="modal-title mt-3 mb-1">Registration</h2>
            <div class="input-box">
              <i class="fa-solid fa-user"></i>
              <input type="text" id="username" required>
              <label>Username</label>
            </div>
            <div class="input-box">
              <i class="fa-solid fa-envelope"></i>
              <input type="email" id="name" required>
              <label>Email</label>
            </div>
            <div class="input-box">
            <i class="fa-solid fa-user-lock"></i>
              <input type="password"  id="password" required>
              <label>Password</label>
            </div>
            <div class="input-box">
              <i class="fa-solid fa-lock"></i>
              <input type="password"  id="confirm_password" required>
              <label>Confirm Password</label>
            </div>
            <div class="remember-forgot-registration">
                <label> <input type="checkbox" id="remember">I agree to the terms & conditions</label>
            </div>
            <button type="register" class="btn-register">Register</button>
            <div class="login-register">
              <p>Already have an account ? <a href="#" class="login-link">Login</a></p>
            </div>
            
          </form>
      </div>
    </div>
    </div>


    <div id="map"></div>
    <script src="{{ asset ('rsc/js/config.js')}}"></script>
    <script src="{{ asset ('rsc/js/apiService.js')}}"></script>
    <script src="{{ asset ('rsc/js/map.js')}}"></script>
    <script src="{{ asset ('rsc/js/login-registration.js')}}"></script>
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
