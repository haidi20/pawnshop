package routes

import (
	"net/http"
	"pawnshop/app/http/controller"

	"github.com/gin-gonic/gin"
)

func SetupAPIRoutes(r *gin.Engine) {
	dashboardController := controller.NewDashboardController()

	r.GET("/", initialRoute)
	r.GET("/dashboard", dashboardController.Index)

	apiV1 := r.Group("/api/v1")
	{
		apiV1.GET("/", initialRouteAPI)
		apiV1.GET("/dashboard", dashboardController.Index)
	}
}

func initialRoute(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "pawnshop"})
}

func initialRouteAPI(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "pawnshop"})
}
