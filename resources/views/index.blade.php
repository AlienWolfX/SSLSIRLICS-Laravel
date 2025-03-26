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
    <!-- To show easy to modify ---   <div class="modal show" id="login" tabindex="-1" aria-labelledby="loginLabel" aria-hidden="false" style="display: block;"> -->
    <div class="modal" id="login" tabindex="-1" aria-labelledby="loginLabel" aria-hidden="true">
      <!-- To hide and clickable ---   <div class="modal" id="login" tabindex="-1" aria-labelledby="loginLabel" aria-hidden="true"> -->
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content-l ">
          <span class = "logo_l">
          <x-application-logo class="rounded-lg shadow-md" />
          </span>

          <span class="icon-close mb-5">
              <i class="fa-solid fa-xmark" data-bs-dismiss="modal" aria-label="Close"></i>
                <!-- To show easy to modify ---   <button type="button" class="btn-close" aria-label="Close"></button> -->
              <!-- <button type="button" class="btn-close" aria-label="Close"></button> -->
              <!-- To hide and clickable ---   <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
            </span>
            <form class="login-form" id="loginForm" method="POST" action="{{ route('login') }}">
                @csrf
                <h2 class="modal-title_l ">Login</h2>
              <div class="mt-3"></div>
                <div class="input-box mt-5">
                    <i class="fa-solid fa-envelope"></i>
                    <input type="email" id="emailLogin" name="email" required>
                    <label>Email</label>
                </div>
                <div class="input-box">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" id="passwordLogin" name="password" required>
                    <label>Password</label>
                </div>
                <div class="remember-forgot">
                    <label><input type="checkbox" id="remember" name="remember">Remember me</label>
                    <a href="{{ route('password.request') }}">Forgot Password?</a>
                </div>
                <div id="loginError" class="alert alert-danger mt-2 d-none"></div>
                <button type="submit" class="btn-login">Login</button>
                <div class="login-register">
                    <p>Don't have an account? <a href="#" class="register-link">Register</a></p>
                </div>
            </form>
        </div>
      </div>
    </div>


    <!-- To show easy to modify ---   <div class="modal show" id="register" tabindex="-1" aria-labelledby="registerLabel" aria-hidden="false" style="display: block;"> -->
    <div class="modal" id="register" tabindex="-1" aria-labelledby="registerLabel" aria-hidden="true">
      <!-- To hide and clickable ---   <div class="modal" id="register" tabindex="-1" aria-labelledby="registerLabel" aria-hidden="true"> -->
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content-registration  ">
          <span class = "logo_r">
              <x-application-logo class="rounded-lg shadow-md" />
          </span>
          <span class="icon-close">
            <i class="fa-solid fa-xmark"  data-bs-dismiss="modal" aria-label="Close" ></i>
              <!-- To show easy to modify ---   <button type="button" class="btn-close" aria-label="Close"></button> -->
            <!-- <button type="button" class="btn-close" aria-label="Close"></button> -->
            <!-- To hide and clickable ---   <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
          </span>
          <form class="registration-form" id="registerForm" method="POST" action="{{ route('register') }}">
            @csrf
            <h2 class="modal-title_r">Registration</h2>
            <div class="mt-4"></div>
            <div class="input-box mt-5">
                <i class="fa-solid fa-user"></i>
                <input type="text" id="name" name="name" required>
                <label>Name</label>
            </div>
            <div class="input-box">
                <i class="fa-solid fa-envelope"></i>
                <input type="email" id="emailRegister" name="email" required>
                <label>Email</label>
            </div>
            <div class="input-box">
                <i class="fa-solid fa-user-lock"></i>
                <input type="password" id="passwordRegister" name="password" required>
                <label>Password</label>
            </div>
            <div class="input-box">
                <i class="fa-solid fa-lock"></i>
                <input type="password" id="password_confirmation" name="password_confirmation" required>
                <label>Confirm Password</label>
            </div>
            <div class="remember-forgot-registration">
                <label><input type="checkbox" id="terms" name="terms" required>I agree to the terms & conditions</label>
            </div>
            <div id="registerError" class="alert alert-danger mt-2 d-none"></div>
            <button type="submit" class="btn-register">Register</button>
            <div class="login-register">
                <p>Already have an account? <a href="#" class="login-link">Login</a></p>
            </div>
        </form>
      </div>
    </div>
    </div>


    <div id="map"></div>

    <div class="modal fade" id="streetlightModal" tabindex="-1" aria-labelledby="streetlightModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-gradient py-2">
            <h5 class="modal-title" id="streetlightModalLabel">
              <i class="fas fa-lightbulb me-2"></i>Streetlight Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-3">
            <div class="row g-3">
              <!-- Left Side - Metric Cards -->
              <div class="col-lg-4">
                <div class="sticky-top" style="top: 20px">
                    <div class="location-section fw-bold fs-4 mb-4 text-center d-flex flex-column">
                        <div class="location-container">
                            <span id="modal-location" class="location-text">-</span>
                            <a href="#" id="modal-directions-btn" class="location-directions ms-2" title="Get directions" style="display:none">
                                <i class="fas fa-directions"></i>
                            </a>
                        </div>
                        <small id="modal-landmark" class="mb-2 landmark-text">-</small>
                        <div class="socid-container">
                            <small class="text-muted fs-6 socid-badge" id="modal-socid">-</small>
                        </div>
                    </div>
                  <!-- Solar Panel Card -->
                  <div class="card shadow-sm mb-4 hover-lift">
                    <div class="card-header bg-gradient">
                      <h5 class="mb-0">
                        <i class="fas fa-solar-panel me-2 solar-icon"></i>Solar Panel
                      </h5>
                    </div>
                    <div class="card-body text-center">
                      <div class="row">
                        <div class="col-6">
                          <i class="fas fa-bolt metric-icon solar-icon"></i>
                          <div class="metric-value">
                            <span id="modal-solv">-</span> V
                          </div>
                          <div class="metric-label">Voltage</div>
                        </div>
                        <div class="col-6">
                          <i class="fas fa-charging-station metric-icon solar-icon"></i>
                          <div class="metric-value">
                            <span id="modal-solc">-</span> A
                          </div>
                          <div class="metric-label">Current</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Status Card -->
                  <div class="card shadow-sm mb-4 hover-lift">
                    <div class="card-header bg-gradient">
                      <h5 class="mb-0">
                        <i class="fas fa-info-circle me-2 status-icon"></i>Status
                      </h5>
                    </div>
                    <div class="card-body text-center">
                      <div class="row">
                        <div class="col-6">
                          <i class="fas fa-clock metric-icon status-icon"></i>
                          <div class="metric-value">
                            <span id="modal-last-update">-</span>
                          </div>
                          <div class="metric-label">Last Updated</div>
                        </div>
                        <div class="col-6">
                          <i class="fas fa-power-off metric-icon status-icon"></i>
                          <div class="metric-value">
                            <span id="modal-status-badge" class="badge bg-secondary">-</span>
                          </div>
                          <div class="metric-label">Current Status</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Load Card -->
                  <div class="card shadow-sm hover-lift">
                    <div class="card-header bg-gradient">
                      <h5 class="mb-0">
                        <i class="fas fa-lightbulb me-2 load-icon"></i>Load
                      </h5>
                    </div>
                    <div class="card-body text-center">
                      <div class="row">
                        <div class="col-6">
                          <i class="fas fa-bolt metric-icon load-icon"></i>
                          <div class="metric-value">
                            <span id="modal-bulbv">-</span> V
                          </div>
                          <div class="metric-label">Voltage</div>
                        </div>
                        <div class="col-6">
                          <i class="fas fa-charging-station metric-icon load-icon"></i>
                          <div class="metric-value">
                            <span id="modal-curv">-</span> A
                          </div>
                          <div class="metric-label">Current</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Battery & Charging History -->
              <div class="col-lg-8">
                <div class="card shadow hover-lift h-100">
                  <div class="card-header bg-gradient">
                    <h5 class="mb-0">
                      <i class="fas fa-battery-three-quarters me-2 battery-icon"></i>
                      Battery & Charging History
                    </h5>
                  </div>
                  <div class="card-body p-4">
                    <!-- Battery Info Section -->
                    <div class="row mb-4">
                      <div class="col-md-4">
                        <div class="battery-status-main p-4 rounded bg-light h-100">
                          <i class="fas fa-battery-three-quarters battery-icon" style="font-size: 3rem"></i>
                          <div class="display-4 mt-2">
                            <span id="modal-batsoc">-</span>%
                          </div>
                          <div class="text-muted">State of Charge</div>
                        </div>
                      </div>
                      <div class="col-md-8">
                        <div class="row h-100">
                          <div class="col-md-6">
                            <div class="battery-status-main p-4 rounded bg-light h-100">
                              <i class="fas fa-bolt battery-icon" style="font-size: 3rem"></i>
                              <div class="display-5 mt-2">
                                <span id="modal-batv">-</span> V
                              </div>
                              <div class="text-muted">Battery Voltage</div>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="battery-status-main p-4 rounded bg-light h-100">
                              <i class="fas fa-charging-station battery-icon" style="font-size: 3rem"></i>
                              <div class="display-5 mt-2">
                                <span id="modal-batc">-</span> A
                              </div>
                              <div class="text-muted">Charging Current</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Chart Section -->
                    <div class="chart-section">
                      <div class="chart-container" style="height: 400px">
                        <div id="modal-charging-chart"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
